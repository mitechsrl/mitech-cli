/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const _target = require('../../../lib/target');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const ssh = require('../../../lib/ssh');
const inquirer = require('inquirer');
const createPackage = require('./createPackage');
const logger = require('../../../lib/logger');

module.exports.info = [
    'Utility deploy App su VM',
    'Esegue un deploy su una VM con ambiente nodejs: carica il progetto locale, esegue npm install e pm2 restart.',
    'I files caricati possono essere controllati tramite il file .mitechcliignore, avente sintassi identica a .gitIgnore.',
    'Per default, vengono escluse le directory node_modules e .git'
];
module.exports.help = [
    ['-d', 'Esegui il download del backup dell\'app remota']
];

const appsContainer = '/apps/';

module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);
    if (!target) return;

    const nodeUser = target.nodeUser || 'node';
    const packajeJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packajeJsonPath)) {
        logger.error('Nessun package.json trovato in questa directory');
        return;
    }
    const packajeJson = JSON.parse(fs.readFileSync(packajeJsonPath).toString());
    let packageName = packajeJson.name;
    if (packageName.split('/').length > 1) { packageName = packageName.split('/')[1]; }

    // Conferma per essere sicuri
    const response = await inquirer.prompt({
        type: 'confirm',
        name: 'yes',
        message: packajeJson.name + ' verrà deployato sul target selezionato. Continuare?'
    });

    if (!response.yes) {
        logger.error('Deploy abortito');
        return;
    }

    // do we need to download the entire app backup?
    const downloadBackup = params.findIndex(p => p === '-d') >= 0;

    // compress the cwd() folder
    const projectTar = await createPackage();

    // connect to ssh remote target
    const session = await ssh.createSshSession(target);

    logger.info('Check environment...');

    // get destination paths from the remote target
    const _remoteTempFile = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = _remoteTempFile.trim() + uuid.v4() + '.tgz';
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';
    const remoteDeployInstructionsPackageJson = remoteDeployBasePath + 'package.json';

    // upload files
    logger.info('Upload: ' + packageName + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    logger.info('Upload: deploy-instructions.js');
    if (session.os.linux) {
        // on linux upload will store the files into tmp then copy them in their final position with the appropriate user.
        // this is to avoid permission problems between the uploading user and the target directory user.
        let _f = _remoteTempFile.trim() + 'deploy-package.json';
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-package.json'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsPackageJson]);
        await session.command(['rm', _f]);

        _f = _remoteTempFile.trim() + 'deploy-instructions.js';
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-instructions.js'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsFile]);
        await session.command(['rm', _f]);

        // set as owned by nodeUser so he can delete it later
        await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);
    } else {
        // on other platforms (read as: windows) the upload store the files directly in their final position
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-package.json'), remoteDeployInstructionsPackageJson);
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-instructions.js'), remoteDeployInstructionsFile);
    }

    // run the server deploy utility
    logger.info('Run deploy-instructions.js');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'install']);
    const parts = ['node', remoteDeployInstructionsFile, '-o', 'deploy', '-p', packageName, '-a', '"' + remoteTempFile + '"'];
    const result = await session.commandAs(nodeUser, parts);

    // check if we have a backup file and download it
    const matchStr = '[BACKUP-FILE]:';
    let backupFileLine = result.split('\n').find(line => line.indexOf(matchStr) >= 0);
    if (downloadBackup && backupFileLine) {
        backupFileLine = backupFileLine.substr(matchStr.length).trim();
        let file = backupFileLine.split(/[\/\\]/g).pop();
        const filePath = path.join(process.cwd(), './deploy-backups/');
        fs.mkdirSync(filePath, { recursive: true });
        file = path.join(filePath, file);
        logger.log('Download backup file: ' + file);
        await session.downloadFile(backupFileLine, file);
    }

    logger.log('Deploy terminato');
    session.disconnect();
};
