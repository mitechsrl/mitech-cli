/* eslint-disable no-process-exit */
const os = require('os');
const path = require('path');
const fs = require('fs');
const _spawn = require('child_process').spawn;

/**
 * common values
 */
const isWindows = os.platform() === 'win32';
let pm2EcosystemFileName = 'ecosystem.config.json';
const appsContainer = path.join(os.homedir(), '/apps/');
if (!fs.existsSync(path.join(appsContainer, pm2EcosystemFileName))){
    pm2EcosystemFileName = 'ecosystem.config.js';
}

process.chdir(appsContainer);
const pm2 = isWindows ? 'pm2.cmd' : 'pm2';
const npm = isWindows ? 'npm.cmd' : 'npm';
const dockerBinPath = '/usr/bin/docker';
const notationBinPath = '/usr/bin/notation';

let backupDir = path.join(os.tmpdir(), './deploy-backups');

// keep these backups
const keepBackupsCount = 4;

const loadPm2EcosystemFile = (pm2File)=> {
    if (pm2File.endsWith('.json')){
        return JSON.parse(fs.readFileSync(pm2File).toString());
    }else if (pm2File.endsWith('.js')){
        return require(pm2File);
    }else{
        throw new Error('File pm2 invalido: '+pm2File);
    }
};
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
 * Check parameters from command line presence
 * @param {*} name
 * @returns null or string
 */
const hasArgvParam = (name) => {
    const index = process.argv.findIndex(p => p === name);
    return  (index <= 0)
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
    const pm2EcosystemFile = loadPm2EcosystemFile(
        path.join(appsContainer, pm2EcosystemFileName)
    );
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
        
        if (!silent) console.log(`Eseguo <${cmd} ${params.join(' ')}>`);

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
 * Valido solo per environment basati su pm2
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
 * Remove older backup files.
 * Valido solo per environment basati su pm2
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
 * Esegue il restore di un progetto in environemtn basato su pm2.
 * Valido solo per environment basati su pm2
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
    if (fs.existsSync(destinationProjectDir)){
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
 * Esegue deploy applicazione in environment basato su pm2
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
            const ecosystemConfig = loadPm2EcosystemFile(pm2EcosystemFile);
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

/**
 * Rollout docker service.
 * Crea o aggiorna un servizio con logica zero-downtime.
 * Ispirato da https://github.com/Wowu/docker-rollout, ma reimplementato in node per 
 * migliore chiarezza.
 * 
 * Logica: senza toccare le istanze dell servizio esistente, tira su un container con nuova versione.
 * Se ok, smonta i container vecchi e rigenera un numero pari a quelli presenti prima del rollout.
 * NOTA: una volta smontata la versione vecchia, rimane una sola istanza dell'app aggiornata per qualche momento,
 * fintantochè le nuove istanza non vengono generate.
 */
const dockerRollout = async () => {
    let serviceName = argvParam('-s');
    let verifyImage = argvParam('--verify-image');

    if (serviceName.startsWith('"')) serviceName = serviceName.substring(1);
    if (serviceName.endsWith('"')) serviceName = serviceName.substring(0, serviceName.length-1);

    if (verifyImage){
        // Verify image using notation
        // https://github.com/notaryproject/notation
        if (verifyImage.startsWith('"')) verifyImage = verifyImage.substring(1);
        if (verifyImage.endsWith('"')) verifyImage = verifyImage.substring(0, verifyImage.length-1);
        const verifyResult = await spawn(notationBinPath, ['verify',verifyImage], {silent:false});
        if (verifyResult.code !== 0){
            throw new Error([
                "!!WARNING!! Verifica firma immagine fallita: "+verifyResult.data,
                "Controlla questi elementi: Accesso a contariner registry, certificato, file trustpolicy.json.",
                "Se tutto è ok, allora l'immagine docker E' STATA ALTERATA! NON FARE DEPLOY!"
            ])
        }else{
            console.log("Verifica firma immagine completata con successo!");
        }
    }
    
    // list of containers for this service.
    console.log("Check container presenti");
    const _oldContainerIds = await spawn(dockerBinPath, ['compose','ps','--quiet', serviceName], {silent:true})
    const oldContainerIds = _oldContainerIds.data.toString().match(/[a-f0-9]+/gm) || [];

    let composeUpResult = null;
    if (oldContainerIds.length>0){
        // old version available. Scale the number of instances
        console.log(`Presenti ${oldContainerIds.length} istanze`);
        console.log(`Ids: ${oldContainerIds.join(',' )}`);
        console.log("");
        console.log("Creo un nuovo container con immagine aggiornata");

        // Create a single new container for the new version
        composeUpResult  = await spawn(dockerBinPath, [
            'compose','up', // tira su i nuovi container
            '-d', // detached, dopo il comando esci e lascia il contenitore in background
            '--scale', `${serviceName}=${oldContainerIds.length+1}`,
            '--no-recreate' // Non ricrearele istanze già presenti
        ])
    }else{
        // no old version available. Create a brand new instance
        console.log("Creo nuovo container");

        // Create a single new container for the new app
        // Effectively instantiate another container
        composeUpResult  = await spawn(dockerBinPath, [
            'compose','up',
            '-d',
            serviceName
        ])
    }

    if (composeUpResult.code !== 0){
        throw new Error("Impossibile caricare nuovo container")
    }

    // cerca gli id dei nuovi container.. saranno da eliminare tutti gli altri
    // NOTA: lo tratto come array ma contiene 1 solo elemento
    const _newContainerIds = await spawn(dockerBinPath,['compose','ps','--quiet', serviceName],  {silent:true})
    const newContainerIds = (_newContainerIds.data.toString().match(/[a-f0-9]+/gm) || []).filter(i => !oldContainerIds.includes(i));

    // HEALTHCHECKS
    // docker-rollout: https://github.com/Wowu/docker-rollout/blob/main/docker-rollout#L101
    // https://docs.docker.com/engine/reference/builder/#healthcheck

    console.log("Attendo stato nuovo container...");
    let isHealthy = false;
    let healthCountdown = 60;
    console.log(`Countdown (${healthCountdown}): `);
    while(1){
        process.stdout.write('/'+healthCountdown);
        const inspectResult = await spawn(dockerBinPath,['inspect', newContainerIds[0]],  {silent:true});
        const inspectJson = JSON.parse(inspectResult.data.toString());
        const health = (inspectJson[0].State || {}).Health;
        const status = (inspectJson[0].State || {}).Status || '';
        if (!health){
            // container does not includes healtchecks. Use basic status
            if (status === 'running') {isHealthy = true; break;}
            if (status === 'exited') {isHealthy = false; break;}
            if (status === 'dead') {isHealthy = false; break;}
        }else{
            // container does includes healtchecks. Use them (more accuracy)
            isHealthy = isHealthy || health.Status === 'healthy';
        }

        if (isHealthy) break;

        // try for healthCountdown times, then exit regardless of status.
        // In that case, consider it unhealthy
        await new Promise(r => setTimeout(r,1000));
        healthCountdown--;
        if (healthCountdown === 0) break;
    }
    
    console.log("");

    // Il nuovo container non è su.
    // Eliminalo e interrompi il deploy
    if (!isHealthy){
        const error = "Il nuovo container non è ok. Interrompo";
        console.log(error);
        await spawn(dockerBinPath,['stop', newContainerIds[0]]);
        await spawn(dockerBinPath,['rm',newContainerIds[0]]);
        throw new Error(error);
    }

    console.log("Il nuovo container è ok.");
    console.log("Ids: "+newContainerIds.join(',' ));

    if (oldContainerIds.length>0){
        console.log("Fermo tutti i vecchi containers");
        for (const oldContainerId of oldContainerIds){
            await spawn(dockerBinPath,['stop',oldContainerId], {silent:true});
            await spawn(dockerBinPath,['rm',oldContainerId], {silent:true});
        }
    }
    
    if (oldContainerIds.length >0 && (newContainerIds.length !== oldContainerIds.length)){
        console.log("Rigenero il numero corretto di containers nuovi")
        // Updating the number of containers to the previous amount
        await spawn(dockerBinPath, [
            'compose','up',
            '--detach',
            '--scale', `${serviceName}=${oldContainerIds.length}`,
            '--no-recreate'
        ])
    }
}

/*********************  flags swicth section *******************/
const operation = argvParam('-o');
let promise = Promise.resolve();
switch (operation) {
case 'install': promise = install(); break;
case 'deploy': promise = deploy(); break;
case 'docker-rollout': promise = dockerRollout(); break;
case 'restoreBackup': promise = restoreBackup(); break;
case 'files': promise = deployFiles(); break;
case 'rm': promise = rmTmp(); break;
case 'lsApps': promise = lsApps().then(apps => console.log(JSON.stringify(apps, null, 4))); break;
case 'lsBackups': promise = lsBackups().then(files => console.log(JSON.stringify(files, null, 4))); break;
case 'cleanBackups': promise = cleanBackups(); break;
default: console.error('Mmmh.. non hai passato "-o" ??'); break;
}

promise
    // eslint-disable-next-line no-process-exit
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        console.log('[FATAL-ERROR]');
        process.exit(-1);
    });
