/* eslint-disable no-process-exit */
const os = require('os');
const path = require('path');
const fs = require('fs');
const _spawn = require('child_process').spawn;

/**
 * common values
 */
const isWindows = os.platform() === 'win32';
const pm2EcosystemFileName = 'ecosystem.config.json';
const appsContainer = path.join(os.homedir(), '/apps/');
process.chdir(appsContainer);
const pm2 = isWindows ? 'pm2.cmd' : 'pm2';
const npm = isWindows ? 'npm.cmd' : 'npm';

let backupDir = path.join(os.tmpdir(), './deploy-backups');

// keep these backups
const keepBackupsCount = 4;

/**
 * Extract parameters from command line
 * @param {*} name
 * @returns null or string
 */
const argvParam = (name) => {
    const index = process.argv.findIndex(p => p === name);
    if (index <= 0) return null;
    return process.argv[index + 1];
};

/**
 *
 * @param {*} projectName
 * @returns
 */
const readStatus = async (projectName) => {
    const status = await spawn(pm2, ['jlist'], { cwd: appsContainer, silent: true });
    const statusJson = JSON.parse(status.data.toString().trim());
    let error = null;

    const date = new Date().toISOString().substring(11);
    statusJson.forEach(app => {
        if (app.name === projectName) {
            if (app.pm2_env.status === 'errored') {
                error = 'pm2 status errored';
            }
            console.log(date + ' PM_ID=' + app.pm_id + ', PID=' + app.pid + ', STATUS=' + app.pm2_env.status);
        }
    });

    return error;
};

/**
 * Read the ecosystem config file to get the list of apps
 */
const lsApps = async () => {
    const pm2File = path.join(appsContainer, './ecosystem.config.json');
    const pm2EcosystemFile = JSON.parse(fs.readFileSync(pm2File).toString());
    return pm2EcosystemFile.apps.map(a => a.name);
};

/**
 * rProxy function to node spawn
 * @param {*} cmd
 * @param {*} params
 * @param {*} options
 */
const spawn = (cmd, params, options) => {
    return new Promise((resolve, reject) => {
        const _opt = Object.assign({
            stdio: 'pipe'
        }, options || {});

        const silent = _opt.silent || false;
        delete _opt.silent;

        const proc = _spawn(cmd, params, _opt);

        let _data = Buffer.from('');
        proc.stdout.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (!silent) process.stdout.write(data.toString());
        });

        proc.stderr.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (!silent) process.stdout.write(data.toString());
        });

        proc.on('close', (code) => resolve({ code: code, data: _data }));

        proc.on('error', (err) => reject(err));
    });
};

/**
 * This script may require extra packages. Install them
 */
const install = async () => {
    console.log('Installazione dipendenze deploy...');
    const result = await spawn(npm, ['install'], { cwd: appsContainer });
    if (result.code !== 0) throw new Error('Installazione dipendenze deploy fallita. ');
};

/**
 * Remove a file under tmp dir
 */
const rmTmp = async () => {
    const filename = argvParam('-f');
    if (!filename) {
        console.error('File non definito. Usa <-f path>');
        process.exit(-1);
    }

    const tmpdir = os.tmpdir();
    if (!filename.startsWith(tmpdir)) {
        console.error('File ' + filename + 'Non eliminato. E\' possibile eliminare solo files di ' + tmpdir);
        process.exit(-1);
    }

    fs.unlinkSync(filename);
};

/**
 * Utility per upload files arbitrario
 */
const deployFiles = async () => {
    // eslint-disable-next-line node/no-missing-require
    const fse = require('fs-extra');

    const tar = require('tar');
    const destination = argvParam('-d');
    const archivePath = argvParam('-a');
    const erase = argvParam('-e');

    if (!destination) {
        console.error('Destination non definita. Usa <-d name>');
        process.exit(-1);
    }

    if (!archivePath) {
        console.error('Archivio sorgente non definito. Usa <-a path>');
        process.exit(-1);
    }

    const destinationDir = path.resolve(appsContainer, destination);

    if (erase) {
        const toDelete = path.resolve(destinationDir, erase);
        fse.removeSync(toDelete);
    }

    fs.mkdirSync(destinationDir, { recursive: true });
    await tar.x({
        file: archivePath,
        cwd: destinationDir
    });

    console.log('Deploy completato');

    fs.unlinkSync(archivePath);
};

/**
 * scan the backup directory and list all found files
 */
const lsBackups = async () => {
    const scanDirRecoursive = function (dirPath, arrayOfFiles) {
        const files = fs.readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];
        files.forEach(function (file) {
            if (fs.statSync(dirPath + '/' + file).isDirectory()) {
                arrayOfFiles = scanDirRecoursive(dirPath + '/' + file, arrayOfFiles);
            } else {
                const filePath = path.join(dirPath, '/', file);
                const stats = fs.statSync(filePath);
                arrayOfFiles.push({ path: filePath, size: (stats.size / (1024 * 1024)).toFixed(3) + 'Mb', ctime: stats.ctime });
            }
        });

        return arrayOfFiles;
    };

    let dir = backupDir;
    const app = argvParam('-a');
    if (app) {
        dir = path.join(dir, app);
    }
    if (fs.existsSync(dir)) {
        return scanDirRecoursive(dir);
    }

    return [];
};

/**
 * Remove older backup files
 */
const cleanBackups = async (projectName = null) => {
    const files = await lsBackups();

    const projects = {};
    files.forEach(file => {
        const fullFilePath = file.path;
        const project = path.basename(path.dirname(fullFilePath));

        projects[project] = projects[project] || [];
        projects[project].push({ ctime: file.ctime, filename: fullFilePath });
    });

    Object.keys(projects).forEach(projectKey => {
        if (projectName && projectName !== projectKey) return;

        // ordino per meno recenti ed elimino quelli piu vecchi fino a mantenerne un massimo di keepBackupsCount
        projects[projectKey].sort((a, b) => b.ctime.getTime() - a.ctime.getTime());
        while (projects[projectKey].length > keepBackupsCount) {
            const file = projects[projectKey].pop();
            console.log('Rimozione ', file.filename);
            fs.unlinkSync(file.filename);
        }
    });
};

/**
 * Esegue il restore di un progetto
 */
const restoreBackup = async () => {
    const tar = require('tar');

    const archivePath = argvParam('-a');
    const projectName = argvParam('-p');

    if (!projectName) {
        console.error('Nome progetto non definito. Usa <-p name>');
        process.exit(-1);
    }

    if (!archivePath) {
        console.error('Archivio progetto non definito. Usa <-a path>');
        process.exit(-1);
    }

    if (!fs.existsSync(archivePath)) {
        console.error('Il file archivio ' + archivePath + ' non esiste. Verifica la correttezza del path fornito.');
        process.exit(-1);
    }

    const destinationProjectDir = path.join(appsContainer, projectName);
    const destinationProjectDirOld = destinationProjectDir + '_OLD-' + (new Date().toISOString().replace(/[:.]/g, '-'));

    console.log('Eseguo restore backup progetto');
    console.log('Stop app ' + projectName + '...');
    await spawn(pm2, ['stop', projectName], { cwd: appsContainer });

    // sposto la cartella di destinazione da /home/onit/apps/projectName a /home/onit/apps/projectName_OLD
    // NOTE: recoursive needs node >12.10
    if (fs.existsSync(destinationProjectDirOld)){
        fs.rmdirSync(destinationProjectDirOld, { recursive: true });
    }
    if (fs.existsSync(destinationProjectDir))
        console.log('Rename ' + destinationProjectDir + ' in ' + destinationProjectDirOld);
        fs.renameSync(destinationProjectDir, destinationProjectDirOld);
    }

    // scompatto il vecchio archivio in /home/onit/apps/projectName
    console.log('Scompatto ' + archivePath + ' in ' + destinationProjectDir);
    fs.mkdirSync(destinationProjectDir, { recursive: true });
    await tar.x({
        file: archivePath,
        cwd: '/', 
        strict: true,
        preservePaths: true,
        onwarn: (a,b,c) => {
            console.log('WARN', a, b, c);
        }
    });

    // lancio polling stato app
    const interval = setInterval(async () => {
        await readStatus(projectName);
    }, 2000);

    // rilancio l'app
    console.log('Archivio scompattato, lancio app...');
    const pm2EcosystemFile = path.join(appsContainer, pm2EcosystemFileName);
    const r = await spawn(pm2, ['restart', pm2EcosystemFile, '--only', projectName, '--update-env'], { cwd: appsContainer });

    clearInterval(interval);

    // NOTE: recoursive needs node >12.10
    if (fs.existsSync(destinationProjectDirOld)){
        console.log('Remove ' + destinationProjectDirOld);
        fs.rmdirSync(destinationProjectDirOld, { recursive: true });
    }
    
    if (r.code !== 0) {
        console.log('Restart fallito');
    } else {
        console.log('Restore completato.');
    }
};

/**
 * deploy function
 */
const deploy = async () => {
    const tar = require('tar');
    const projectName = argvParam('-p');
    const archivePath = argvParam('-a');
    const doBackup = process.argv.findIndex(p => p === '-nb') < 0;

    if (!projectName) {
        console.error('Nome progetto non definito. Usa <-p name>');
        process.exit(-1);
    }

    if (!archivePath) {
        console.error('Archivio progetto non definito. Usa <-a path>');
        process.exit(-1);
    }

    // helper internal fn
    const cleanOnExit = () => {
        fs.unlinkSync(archivePath);
    };

    const destinationProjectDir = path.join(appsContainer, projectName);

    let destinationBackupFile = null;

    console.log('Verifico presenza app...');
    const values = await spawn(pm2, ['pid', projectName], { silent: true });

    const appPid = values.data || '';
    let appFound = false;

    if (appPid && appPid.toString().trim().split('\n').filter(v => !!v).shift()) {
        appFound = true;
    }
    if (appFound && fs.existsSync(destinationProjectDir)) {
        if (doBackup) {
            console.log('App trovata. Eseguo backup. Questa operazione potrebbe impiegare qualche decina di secondi...');
            backupDir = path.join(backupDir, projectName);
            destinationBackupFile = path.join(backupDir, (new Date().toISOString().replace(/:/g, '_')) + '.tgz');
            fs.mkdirSync(backupDir, { recursive: true });

            await tar.c({
                gzip: { level: 1 }, // this offer lower compression ratio but faster speed. Increase the number for lower speed & higher compression
                file: destinationBackupFile,
                cwd: destinationProjectDir,
                preservePaths: true,
                // filter: filter
            }, [destinationProjectDir]);

            // WARN!! keep string as '[BACKUP-FILE]:' so the cli can detect the filename
            console.log('[BACKUP-FILE]: ' + destinationBackupFile);
            const stats = fs.statSync(destinationBackupFile);
            console.log('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
        } else {
            console.log('App trovata.');
        }

        console.log('Eseguo deploy e ricarico');
    } else {
        console.log('App non trovata. Eseguo deploy e avvio');
    }

    // decompress the archive in the target directory
    fs.mkdirSync(destinationProjectDir, { recursive: true });
    await tar.x({
        file: archivePath,
        cwd: destinationProjectDir
    });

    // run "npm install --production"
    console.log('Eseguo npm install...');
    const installResult = await spawn(npm, ['install', '--production'], { cwd: destinationProjectDir });
    if (installResult.code !== 0) {
        console.log('[DEPLOY-ERROR]: Install fallito');
        cleanOnExit();
        return;
    }

    // Avvio app
    console.log('Avvio/reload app...');
    let error = null;
    let message = null;
    let interval = null;

    function intervalStatus () {
        interval = setInterval(async () => {
            await readStatus(projectName);
        }, 2000);
    }

    if (!appFound) {
        // app not active. Try to start it
        const pm2EcosystemFile = path.join(appsContainer, pm2EcosystemFileName);
        if (!fs.existsSync(pm2EcosystemFile)) {
            console.error('Errore: ' + pm2EcosystemFileName + ' non trovato. Impossibile avviare pm2');
            error = true;
        } else {
            const ecosystemConfig = JSON.parse(fs.readFileSync(pm2EcosystemFile).toString());
            const app = (ecosystemConfig.apps || []).find(app => app.name === projectName);
            if (!app) {
                console.error('Errore: impossibile avviare l\'app. Entry in ' + pm2EcosystemFileName + ' non trovata');
                error = true;
            } else {
                intervalStatus();
                const r = await spawn(pm2, ['start', pm2EcosystemFileName, '--only', projectName], { cwd: appsContainer });
                if (r.code !== 0) error = 'Start fallito';
                message = 'Avvio completato';
            }
        }
    } else {
        intervalStatus();
        const r = await spawn(pm2, ['restart', pm2EcosystemFileName, '--only', projectName, '--update-env'], { cwd: appsContainer });
        if (r.code !== 0) {
            error = 'Restart fallito';
        } else {
            message = 'Restart completo';
        }
    }

    if (interval) clearInterval(interval);

    if (!error) {
        error = await readStatus(projectName);
    }

    // pm2 start do not signal on errors. Check it manually
    if (!error) {
        // check online status by cpu/memory. See // https://github.com/Unitech/pm2/issues/4355
        const status = await spawn(pm2, ['jlist'], { cwd: appsContainer, silent: true });
        const statusJson = JSON.parse(status.data.toString().trim());
        statusJson.forEach(app => {
            if (app.name === projectName) {
                if (app.pid === 0 && app.monit.cpu === 0 && app.monit.memory === 0) {
                    error = 'Trovata app senza pid/memory. Probabile avvio/riavvio fallito a seguito di crash.\n Verifica con <pm2 logs>';
                }
            }
        });
    }

    if (!error) {
        console.log(message);

        // persist status of pm2
        await spawn(pm2, ['save'], { cwd: appsContainer });

        console.log('Pulisco backup obsoleti');
        await cleanBackups(projectName);
    } else {
        console.log(error);
        console.log('');
        console.log('Puoi tentare un ripristino con il comando <mitech deploy backups restore>');
        console.log('');
        console.log('[DEPLOY-ERROR]: ' + error);
    }

    cleanOnExit();
};

/** *******************  flags swicth section *******************/
const operation = argvParam('-o');
let promise = Promise.resolve();
switch (operation) {
case 'install': promise = install(); break;
case 'deploy': promise = deploy(); break;
case 'restoreBackup': promise = restoreBackup(); break;
case 'files': promise = deployFiles(); break;
case 'rm': promise = rmTmp(); break;
case 'lsApps': promise = lsApps().then(apps => console.log(JSON.stringify(apps, null, 4))); break;
case 'lsBackups': promise = lsBackups().then(files => console.log(JSON.stringify(files, null, 4))); break;
case 'cleanBackups': promise = cleanBackups(); break;
default: console.error('Mmmh.. What did you mean by <-o ' + operation + '>?'); break;
}

promise
    // eslint-disable-next-line no-process-exit
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        console.log('[FATAL-ERROR]');
        process.exit(-1);
    });
