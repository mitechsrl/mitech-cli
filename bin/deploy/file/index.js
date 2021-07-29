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
    'Utility deploy Files su VM',
    'Esegue un deploy di files su una VM remota.'
];
module.exports.help = [
    ['-s', 'File o directory sorgente, rappresenta il file o il path da caricare'],
    ['-d', 'Directory remota in cui copiare i files. Per default parte dalla directory di deploy delle apps']
];

const appsContainer = '/apps/';

module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);
    if (!target) return;

    const nodeUser = target.nodeUser || 'node';

    let toUpload = params.findIndex(p => p === '-s');
    if (toUpload < 0 || typeof (params[toUpload + 1]) !== 'string') {
        logger.error('Nessun file da caricare definito. Usa <-s fileOrPath>.');
        return;
    }

    toUpload = params[toUpload + 1];
    if (!fs.existsSync(toUpload)) {
        logger.error('File o path sorgente ' + toUpload + ' inesistente');
        return;
    }

    const remoteErase = path.relative('./', toUpload);

    let destination = params.findIndex(p => p === '-d');
    if (destination < 0) {
        logger.warn('Destination dir non definita, uso il default (apps folder)');
        destination = './';
    } else {
        destination = params[destination + 1];
    }

    logger.log('Carico ' + toUpload + ' in RemoteAppsFolder/' + destination);

    // Conferma per essere sicuri
    const response = await inquirer.prompt({
        type: 'confirm',
        name: 'yes',
        message: toUpload + ' verrà deployato sul target selezionato. Continuare?'
    });
    if (!response.yes) {
        logger.error('Deploy abortito');
        return;
    }

    // compress the cwd() folder
    const projectTar = await createPackage(toUpload);

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
    logger.info('Upload: ' + toUpload + '.tgz');
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
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'files', '-e', remoteErase, '-d', destination, '-a', '"' + remoteTempFile + '"']);

    logger.log('Deploy files terminato');
    session.disconnect();
};
