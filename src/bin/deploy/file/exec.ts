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

import { existsSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { createSshSession } from '../../../lib/ssh';
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction, StringError } from '../../../types';
import { createPackage } from './_lib/createPackage';
import { v4 as uuidv4 } from 'uuid';
import { uploadAndInstallDeployScript } from '../_lib/deployScript';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const target = await getTarget();
    if (!target) return;
    printTarget(target);

    const nodeUser = target.nodeUser || 'node';

    const toUpload = argv.s as string;
    if (!toUpload) {
        throw new StringError('Nessun file da caricare definito. Usa <-s fileOrPath>.');
    }

    if (!existsSync(toUpload)) {
        throw new StringError('File o path sorgente ' + toUpload + ' inesistente');
    }

    const remoteErase = path.relative('./', toUpload);

    let destination = argv.d as string;
    if (!destination) {
        logger.warn('Destination dir non definita, uso il default (apps folder)');
        destination = './';
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
    const session = await createSshSession(target);

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + uuidv4() + '.tgz';

    // upload files
    logger.info('Upload: ' + toUpload + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);
    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    // run the server deploy utility
    logger.info('Copia files');
    await deployScript.call(
        ['-o', 'files', '-e', remoteErase, '-d', destination, '-a', '"' + remoteTempFile + '"'], 
        true);
    // questo command vuoto perchè c'era??
    // await session.commandAs(nodeUser);

    logger.log('Deploy files terminato');
    session.disconnect();
};

export default exec;