"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const tar_1 = __importDefault(require("tar"));
const yaml_1 = require("yaml");
// Set the current working dir to apps container
const appsContainer = path_1.default.join(os_1.default.homedir(), '/apps/');
process.chdir(appsContainer);
const isWindows = os_1.default.platform() === 'win32';
let pm2EcosystemFileName = 'ecosystem.config.json';
if (!fs_1.default.existsSync(path_1.default.join(appsContainer, pm2EcosystemFileName))) {
    pm2EcosystemFileName = 'ecosystem.config.js';
}
const pm2 = isWindows ? 'pm2.cmd' : 'pm2';
const npm = isWindows ? 'npm.cmd' : 'npm';
const dockerBinPath = '/usr/bin/docker';
const notationBinPath = '/usr/bin/notation';
let backupDir = path_1.default.join(os_1.default.tmpdir(), './deploy-backups');
const keepBackupsCount = 4; // keep these backups
/**
 * Extract parameters from command line
 * @param {*} name
 * @returns null or string
 */
const argvParam = (name) => {
    const index = process.argv.findIndex(p => p === name);
    if (index <= 0)
        return null;
    return process.argv[index + 1];
};
/**
 *
 * @param pm2File
 * @returns
 */
function loadPm2EcosystemFile(pm2File) {
    if (pm2File.endsWith('.json')) {
        return JSON.parse(fs_1.default.readFileSync(pm2File).toString());
    }
    else if (pm2File.endsWith('.js')) {
        return require(pm2File);
    }
    else {
        throw new Error('File pm2 invalido: ' + pm2File);
    }
}
/**
 *
 * @param {*} projectName
 * @returns
 */
async function readStatus(projectName) {
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
}
/**
 * scan the backup directory and list all found files
 * Valido solo per environment basati su pm2
 */
async function lsBackups() {
    const scanDirRecoursive = function (dirPath, arrayOfFiles) {
        const files = fs_1.default.readdirSync(dirPath);
        files.forEach(function (file) {
            if (fs_1.default.statSync(dirPath + '/' + file).isDirectory()) {
                arrayOfFiles = scanDirRecoursive(dirPath + '/' + file, arrayOfFiles);
            }
            else {
                const filePath = path_1.default.join(dirPath, '/', file);
                const stats = fs_1.default.statSync(filePath);
                arrayOfFiles.push({ path: filePath, size: (stats.size / (1024 * 1024)).toFixed(3) + 'Mb', ctime: stats.ctime });
            }
        });
        return arrayOfFiles;
    };
    let dir = backupDir;
    const app = argvParam('-a');
    if (app) {
        dir = path_1.default.join(dir, app);
    }
    if (fs_1.default.existsSync(dir)) {
        return scanDirRecoursive(dir, []);
    }
    return [];
}
/**
 * Remove older backup files.
 * Valido solo per environment basati su pm2
 * Se projectName è omesso, elimina tutto.
 *
 */
async function cleanBackups(projectName) {
    const files = await lsBackups();
    const projects = {};
    files.forEach(file => {
        const fullFilePath = file.path;
        const project = path_1.default.basename(path_1.default.dirname(fullFilePath));
        projects[project] = projects[project] || [];
        projects[project].push({ ctime: file.ctime, filename: fullFilePath });
    });
    Object.keys(projects).forEach(projectKey => {
        if ((!projectName) || (projectName === projectKey)) {
            // ordino per meno recenti ed elimino quelli piu vecchi fino a mantenerne un massimo di keepBackupsCount
            projects[projectKey].sort((a, b) => b.ctime.getTime() - a.ctime.getTime());
            while (projects[projectKey].length > keepBackupsCount) {
                const file = projects[projectKey].pop();
                if (file) {
                    console.log('Rimozione ', file.filename);
                    fs_1.default.unlinkSync(file.filename);
                }
            }
        }
    });
}
/**
 * Esegue deploy applicazione in environment basato su pm2
 */
async function deploy() {
    const projectName = argvParam('-p');
    const archivePath = argvParam('-a');
    const doBackup = process.argv.findIndex(p => p === '--nobackup') < 0;
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
        fs_1.default.unlinkSync(archivePath);
    };
    const destinationProjectDir = path_1.default.join(appsContainer, projectName);
    let destinationBackupFile = null;
    console.log('Verifico presenza app...');
    const values = await spawn(pm2, ['pid', projectName], { silent: true });
    const appPid = values.data || '';
    let appFound = false;
    if (appPid && appPid.toString().trim().split('\n').filter(v => !!v).shift()) {
        appFound = true;
    }
    if (appFound && fs_1.default.existsSync(destinationProjectDir)) {
        if (doBackup) {
            console.log('App trovata. Eseguo backup. Questa operazione potrebbe impiegare qualche decina di secondi...');
            backupDir = path_1.default.join(backupDir, projectName);
            destinationBackupFile = path_1.default.join(backupDir, (new Date().toISOString().replace(/:/g, '_')) + '.tgz');
            fs_1.default.mkdirSync(backupDir, { recursive: true });
            await tar_1.default.c({
                gzip: { level: 1 },
                file: destinationBackupFile,
                cwd: destinationProjectDir,
                preservePaths: true,
                // filter: filter
            }, [destinationProjectDir]);
            // WARN!! keep string as '[BACKUP-FILE]:' so the cli can detect the filename
            console.log('[BACKUP-FILE]: ' + destinationBackupFile);
            const stats = fs_1.default.statSync(destinationBackupFile);
            console.log('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
        }
        else {
            console.log('App trovata.');
        }
        console.log('Eseguo deploy e ricarico');
    }
    else {
        console.log('App non trovata. Eseguo deploy e avvio');
    }
    // decompress the archive in the target directory
    fs_1.default.mkdirSync(destinationProjectDir, { recursive: true });
    await tar_1.default.x({
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
    function intervalStatus() {
        interval = setInterval(async () => {
            await readStatus(projectName);
        }, 2000);
    }
    if (!appFound) {
        // app not active. Try to start it
        const pm2EcosystemFile = path_1.default.join(appsContainer, pm2EcosystemFileName);
        if (!fs_1.default.existsSync(pm2EcosystemFile)) {
            console.error('Errore: ' + pm2EcosystemFileName + ' non trovato. Impossibile avviare pm2');
            error = true;
        }
        else {
            const ecosystemConfig = loadPm2EcosystemFile(pm2EcosystemFile);
            const app = (ecosystemConfig.apps || []).find(app => app.name === projectName);
            if (!app) {
                console.error('Errore: impossibile avviare l\'app. Entry in ' + pm2EcosystemFileName + ' non trovata');
                error = true;
            }
            else {
                intervalStatus();
                const r = await spawn(pm2, ['start', pm2EcosystemFileName, '--only', projectName], { cwd: appsContainer });
                if (r.code !== 0)
                    error = 'Start fallito';
                message = 'Avvio completato';
            }
        }
    }
    else {
        intervalStatus();
        const r = await spawn(pm2, ['restart', pm2EcosystemFileName, '--only', projectName, '--update-env'], { cwd: appsContainer });
        if (r.code !== 0) {
            error = 'Restart fallito';
        }
        else {
            message = 'Restart completo';
        }
    }
    if (interval)
        clearInterval(interval);
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
    }
    else {
        console.log(error);
        console.log('');
        console.log('Puoi tentare un ripristino con il comando <mitech deploy backups restore>');
        console.log('');
        console.log('[DEPLOY-ERROR]: ' + error);
    }
    cleanOnExit();
}
/**
 * Proxy function to node spawn
 * @param {*} cmd
 * @param {*} params
 * @param {*} options
 */
const spawn = (cmd, params, options) => {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const _opt = Object.assign({
            stdio: 'pipe'
        }, options || {});
        const silent = _opt.silent || false;
        delete _opt.silent;
        if (!silent)
            console.log(`Eseguo <${cmd} ${params.join(' ')}>`);
        const proc = (0, child_process_1.spawn)(cmd, params, _opt);
        let _data = Buffer.from('');
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (!silent)
                process.stdout.write(data.toString());
        });
        (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (!silent)
                process.stdout.write(data.toString());
        });
        proc.on('close', (code) => resolve({ code: code, data: _data }));
        proc.on('error', (err) => reject(err));
    });
};
/**
 * Esegue il restore di un progetto in environemtn basato su pm2.
 * Valido solo per environment basati su pm2
 */
async function restoreBackup() {
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
    if (!fs_1.default.existsSync(archivePath)) {
        console.error('Il file archivio ' + archivePath + ' non esiste. Verifica la correttezza del path fornito.');
        process.exit(-1);
    }
    const destinationProjectDir = path_1.default.join(appsContainer, projectName);
    const destinationProjectDirOld = destinationProjectDir + '_OLD-' + (new Date().toISOString().replace(/[:.]/g, '-'));
    console.log('Eseguo restore backup progetto');
    console.log('Stop app ' + projectName + '...');
    await spawn(pm2, ['stop', projectName], { cwd: appsContainer });
    // sposto la cartella di destinazione da /home/onit/apps/projectName a /home/onit/apps/projectName_OLD
    // NOTE: recoursive needs node >12.10
    if (fs_1.default.existsSync(destinationProjectDirOld)) {
        fs_1.default.rmdirSync(destinationProjectDirOld, { recursive: true });
    }
    if (fs_1.default.existsSync(destinationProjectDir)) {
        console.log('Rename ' + destinationProjectDir + ' in ' + destinationProjectDirOld);
        fs_1.default.renameSync(destinationProjectDir, destinationProjectDirOld);
    }
    // scompatto il vecchio archivio in /home/onit/apps/projectName
    console.log('Scompatto ' + archivePath + ' in ' + destinationProjectDir);
    fs_1.default.mkdirSync(destinationProjectDir, { recursive: true });
    const _opt = {
        file: archivePath,
        cwd: '/',
        strict: true,
        preservePaths: true,
        onwarn: (message, data) => {
            console.log('WARN', message, data.toString());
        }
    };
    await tar_1.default.x(_opt);
    // lancio polling stato app
    const interval = setInterval(async () => {
        await readStatus(projectName);
    }, 2000);
    // rilancio l'app
    console.log('Archivio scompattato, lancio app...');
    const pm2EcosystemFile = path_1.default.join(appsContainer, pm2EcosystemFileName);
    const r = await spawn(pm2, ['restart', pm2EcosystemFile, '--only', projectName, '--update-env'], { cwd: appsContainer });
    clearInterval(interval);
    // NOTE: recoursive needs node >12.10
    if (fs_1.default.existsSync(destinationProjectDirOld)) {
        console.log('Remove ' + destinationProjectDirOld);
        fs_1.default.rmdirSync(destinationProjectDirOld, { recursive: true });
    }
    if (r.code !== 0) {
        console.log('Restart fallito');
    }
    else {
        console.log('Restore completato.');
    }
}
/**
 * Utility per upload files arbitrario
 */
async function deployFiles() {
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
    const destinationDir = path_1.default.resolve(appsContainer, destination);
    if (erase) {
        const toDelete = path_1.default.resolve(destinationDir, erase);
        fs_1.default.rmSync(toDelete, { recursive: true, force: true });
    }
    fs_1.default.mkdirSync(destinationDir, { recursive: true });
    await tar_1.default.x({
        file: archivePath,
        cwd: destinationDir
    });
    console.log('Deploy completato');
    fs_1.default.unlinkSync(archivePath);
}
/**
 * Remove a file under tmp dir
 */
async function rmTmp() {
    const filename = argvParam('-f');
    if (!filename) {
        console.error('File non definito. Usa <-f path>');
        process.exit(-1);
    }
    const tmpdir = os_1.default.tmpdir();
    if (!filename.startsWith(tmpdir)) {
        console.error('File ' + filename + 'Non eliminato. E\' possibile eliminare solo files di ' + tmpdir);
        process.exit(-1);
    }
    fs_1.default.unlinkSync(filename);
}
/**
 * Read the ecosystem config file to get the list of apps
 */
async function lsApps() {
    const pm2EcosystemFile = loadPm2EcosystemFile(path_1.default.join(appsContainer, pm2EcosystemFileName));
    return pm2EcosystemFile.apps.map(a => a.name);
}
/*
 * parse the output of the "docker [COMMAND] --format json" command and return and return a list of objects
*/
function parseDockerJsonOutput(data) {
    return data.toString().split('\n').filter(s => s.length > 0).map(s => {
        try {
            return JSON.parse(s);
        }
        catch (e) {
            return null;
        }
    }).filter(o => !!o);
}
/**
 *
 */
async function deployDockerSwarm() {
    const dockerComposeFileName = 'docker-compose.yml';
    const composeFileContent = fs_1.default.readFileSync(dockerComposeFileName).toString();
    const composeConfig = (0, yaml_1.parse)(composeFileContent);
    const _images = await spawn('sudo', [dockerBinPath, 'image', 'ls', '--format', 'json'], { silent: true });
    const alreadyDownloadedImages = parseDockerJsonOutput(_images.data);
    // Faccio pull priuma così poi il countdown successivo non deve anche includere
    // le tempistiche di download delle immagini
    // NOTA: le immagini DEVONO avere il tag di versione
    for (const service of Object.keys(composeConfig.services)) {
        const image = composeConfig.services[service].image;
        if (image.split(':').length === 1) {
            throw new Error('Immagine non valida: ' + image + ' manca il tag');
        }
        const found = alreadyDownloadedImages.find(i => `${i.Repository}:${i.Tag}` === image);
        if (!found) {
            console.log('Pull preventivo di ', image, '...');
            await spawn('sudo', [dockerBinPath, 'pull', image], { silent: false });
        }
    }
    // Comando principlae di deploy. Questo triggera update di swarm in modo da aggiornare i servizi con le nuove immagini
    // o impostazioni. Una volta eseguito, lancia i task ncessari internamente.
    // Vedi https://docs.docker.com/engine/reference/commandline/stack_deploy/
    console.log('Eseguo deploy del file docker-compose.yml...');
    const deployResult = await spawn('sudo', [dockerBinPath, 'stack', 'deploy', '--with-registry-auth', '--prune', '--compose-file', 'docker-compose.yml', 'default_stack'], { cwd: appsContainer, silent: false });
    if (deployResult.code !== 0) {
        throw new Error('Deploy fallito. ' + deployResult.data.toString());
    }
    else {
        console.log('Deploy di docker-compose.yml completato');
    }
    console.log('Monitor stato servizi...');
    let ok = false;
    let okCount = 0;
    let lastOkMessages = [];
    for (let i = 120; i > 0; i--) {
        lastOkMessages = [];
        process.stdout.write(`${i} `);
        try {
            for (const service of Object.keys(composeConfig.services)) {
                const _servicePs = await spawn('sudo', [dockerBinPath, 'service', 'ps', '--format', 'json', '--filter', 'desired-state=running', 'default_stack_' + service], { silent: true });
                const servicePs = parseDockerJsonOutput(_servicePs.data);
                if (servicePs.length === 0)
                    throw new Error('Nessun servizio ' + service + ' trovato');
                servicePs.forEach(ps => {
                    if (!ps.CurrentState.toLocaleLowerCase().startsWith('running')) {
                        throw new Error('Servizio ' + service + ' non in stato running');
                    }
                    if (!ps.Image.startsWith(composeConfig.services[service].image)) {
                        console.log(composeConfig.services[service].image);
                        console.log('ps image', ps.Image);
                        throw new Error('Servizio ' + service + ' non in stato running con immagine corretta');
                    }
                    lastOkMessages.push('Servizio <defalt_stack_' + service + '> in esecuzione su <' + ps.Node + '> con immagine <' + ps.Image + '> in stato <' + ps.CurrentState + '>');
                });
            }
            okCount++;
            ok = true;
            // Se ho ok per 20 secondi consecutivi, considera il sistema ok.
            // Eventuali servizi caduti in fase di boot rientrano qui
            if (okCount === 20) {
                break;
            }
        }
        catch (e) {
            process.stdout.write(e.message + ' ');
            ok = false;
            okCount = 0;
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('');
    if (!ok) {
        throw new Error('Deploy fallito.');
    }
    lastOkMessages.forEach(m => console.log(m));
    console.log('');
    console.log('Tutti i servizi sono in stato running con immagine a versione corretta');
}
async function main() {
    const operation = argvParam('-o');
    switch (operation) {
        case 'deploy': return deploy();
        case 'deploy-docker-swarm': return deployDockerSwarm();
        case 'restoreBackup': return restoreBackup();
        case 'files': return deployFiles();
        case 'rm': return rmTmp();
        case 'lsApps': return lsApps().then(apps => console.log(JSON.stringify(apps, null, 4)));
        case 'lsBackups': return lsBackups().then(files => console.log(JSON.stringify(files, null, 4)));
        case 'cleanBackups': return cleanBackups();
        default: throw new Error('Mmmh.. non hai passato "-o" ??');
    }
}
main()
    // eslint-disable-next-line no-process-exit
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    console.log('[FATAL-ERROR]');
    process.exit(-1);
});
//# sourceMappingURL=deploy-instructions.js.map