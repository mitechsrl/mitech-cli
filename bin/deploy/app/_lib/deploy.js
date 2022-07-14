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

const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const ssh = require('../../../../lib/ssh');
const inquirer = require('inquirer');
const createPackage = require('./createPackage');
const logger = require('../../../../lib/logger');
const { uploadAndInstallDeployScript } = require('../../_lib/deployScript');
const { downloadBackupFile } = require('../../_lib/backupFile');
const { throwOnFatalError } = require('../../_lib/fatalError');

/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */

module.exports.deploy = async function (target, params) {
    const returnValue = {
        aborted: false,
        complete: false
    };

    const nodeUser = target.nodeUser || 'node';
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('Nessun package.json trovato in questa directory');
    }
    const packajeJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    let packageName = packajeJson.name;
    if (packageName.split('/').length > 1) { packageName = packageName.split('/')[1]; }

    const autoYes = params.get('-y');
    if (!autoYes.found) {
    // Conferma per essere sicuri
        const response = await inquirer.prompt({
            type: 'confirm',
            name: 'yes',
            message: packajeJson.name + ' verrà deployato sul target selezionato. Continuare?'
        });

        if (!response.yes) {
            returnValue.aborted = true;
            return returnValue;
        }
    }

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

    // Do we need to download the entire app backup?
    // If yes, check if we have a backup file and download it
    const downloadBackup = params.get('-d').found;
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

    session.disconnect();

    returnValue.complete = true;
    return returnValue;
};

