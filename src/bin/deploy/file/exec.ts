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
import path from 'path';
import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { createSshSession } from '../../../lib/ssh';
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction, StringError } from '../../../types';
import { createPackage } from './_lib/createPackage';
import { v4 as uuidv4 } from 'uuid';
import { uploadAndInstallDeployScript } from '../_lib/deployScript';
import { confirm } from '../../../lib/confirm';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const target = await getTarget();
    if (!target) return;
    printTarget(target);

    const appUser = target.nodeUser || 'node';

    const toUpload = argv.s as string;
    if (!toUpload) {
        throw new StringError('Nessun file da caricare definito. Usa <-s fileOrPath>.');
    }

    if (!existsSync(toUpload)) {
        throw new StringError('File o path sorgente ' + toUpload + ' inesistente');
    }

    // connect to ssh remote target
    const session = await createSshSession(target);
    
    const remoteErase = path.relative('./', toUpload);
    const defaultDestination = path.posix.join(await session.home(appUser), 'apps' );

    let destination = argv.d as string ?? defaultDestination;
    if (!destination) {
        logger.warn(`Destination dir non definita, uso il default ${defaultDestination}`);
        destination = defaultDestination;
    }

    // Conferma per essere sicuri
    if (! await confirm(argv, toUpload + ' verrà caricato sul target selezionato. Continuare?')){
        logger.error('Deploy abortito');
        return;
    }

    logger.log(`Carico ${toUpload} in ${defaultDestination}`);

    // compress the cwd() folder
    const projectTar = await createPackage(toUpload);

    // get destination paths from the remote target
    const remoteTempFile = path.posix.join(await session.tmp(), uuidv4() + '.tgz');

    // upload files
    logger.info('Upload: ' + toUpload + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', appUser + ':' + appUser, remoteTempFile]);
    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, appUser);

    // run the server deploy utility
    logger.info('Copia files');
    await deployScript.call(
        ['-o', 'files', '-e', remoteErase, '-d', destination, '-a', '"' + remoteTempFile + '"'], 
        true);
    // questo command vuoto perchè c'era??
    // await session.commandAs(appUser);

    logger.log('Deploy files terminato');
    session.disconnect();
};

export default exec;