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
const { uploadAndInstallDeployScript } = require('../_lib/deployScript');
const { downloadBackupFile } = require('../_lib/backupFile');
const { throwOnFatalError } = require('../_lib/fatalError');

module.exports.info = [
    'Utility deploy App su VM'
];
module.exports.help = [
    'Esegue un deploy su una VM con ambiente nodejs: carica il progetto locale, esegue npm install e pm2 restart.',
    'I files caricati possono essere controllati tramite il file .mitechcliignore, avente sintassi identica a .gitIgnore.',
    'Per default, vengono escluse le directory node_modules e .git',
    '',
    ['-d', 'Esegui il download del backup dell\'app remota']
];

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

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + uuid.v4() + '.tgz';

    // upload files
    logger.info('Upload: ' + packageName + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);

    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    // run the server deploy utility
    logger.info('Eseguo deploy app...');
    const result = await deployScript.call(['-o', 'deploy', '-p', packageName, '-a', '"' + remoteTempFile + '"'], true);

    // check if we have a backup file and download it
    if (downloadBackup) {
        downloadBackupFile(session, result);
    }

    // search and match the deploy error tag
    const deployErrorMatch = '[DEPLOY-ERROR]:';
    let deployErrorLine = result.split('\n').find(line => line.indexOf(deployErrorMatch) >= 0);
    if (deployErrorLine) {
        deployErrorLine = deployErrorLine.substr(deployErrorMatch.length).trim();
        throw new Error('Deploy fallito: ' + deployErrorLine);
    }

    // search and match the generic fatal error tag error tag
    throwOnFatalError(result);

    logger.log('Deploy terminato');

    session.disconnect();
};
