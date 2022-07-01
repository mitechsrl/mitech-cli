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
const { uploadAndInstallDeployScript } = require('../_lib/uploadAndInstallDeployScript');

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
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + uuid.v4() + '.tgz';
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';

    // upload files
    logger.info('Upload: ' + toUpload + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);
    // upload script deploy
    await uploadAndInstallDeployScript(session,
        remoteTempDir,
        nodeUser,
        remoteDeployBasePath,
        remoteDeployInstructionsFile);

    logger.info('Upload: deploy-instructions.js');

    // run the server deploy utility
    logger.info('Copia files');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'files', '-e', remoteErase, '-d', destination, '-a', '"' + remoteTempFile + '"']);

    logger.log('Deploy files terminato');
    session.disconnect();
};
