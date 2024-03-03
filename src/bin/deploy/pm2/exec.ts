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

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import yargs from 'yargs';
import { confirm } from '../../../lib/confirm';
import { logger } from '../../../lib/logger';
import { createSshSession } from '../../../lib/ssh';
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction } from '../../../types';
import { appsContainer } from '../_lib/appsContainer';
 
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    const target = await getTarget();
    if (!target) return;
    printTarget(target);

    const nodeUser = target.nodeUser || 'node';
    let filename = 'ecosystem.config.json';
    let ecosystemConfigFilePath = path.join(process.cwd(), filename);

    if (!existsSync(ecosystemConfigFilePath)) {
        filename='ecosystem.config.js';
        ecosystemConfigFilePath = path.join(process.cwd(), filename);
        if (!existsSync(ecosystemConfigFilePath)) {
            logger.error('Nessun ecosystem.config.js(on) trovato in questa directory');
            return;
        }
    }

    // just check js(on) syntax.
    // THis avoid uploading a broken file 
    try {
        if(ecosystemConfigFilePath.endsWith('.json')){
            JSON.parse(readFileSync(ecosystemConfigFilePath).toString());
        }
        if(ecosystemConfigFilePath.endsWith('.js')){
            require(ecosystemConfigFilePath);
        }
    } catch (error) {
        logger.error('Errore di sintassi nel file ' + filename);
        throw error;
    }

    // ask for confirm
    if (!await confirm(argv, `Il file ${filename} verrà caricato sul target selezionato. Continuare?`)){
        return;
    }

    const session = await createSshSession(target);
    const remoteDeployBasePath = path.posix.join(await session.home(nodeUser), '.' + appsContainer);
    const remoteTmpFilename = path.posix.join(await session.tmp(), filename);
    const remoteFilename = remoteDeployBasePath + filename;

    logger.info('Upload: ' + filename + ' in ' + remoteFilename);

    if (session.os.linux) {
        await session.uploadFile(ecosystemConfigFilePath, remoteTmpFilename);
        await session.commandAs(nodeUser, ['cp', remoteTmpFilename, remoteFilename]);
        await session.command(['sudo chown ' + nodeUser + ':' + nodeUser, remoteFilename]);
        await session.command(['sudo chmod 700', remoteFilename]);
    } else {
        await session.uploadFile(ecosystemConfigFilePath, remoteFilename);
    }

    logger.info('Upload completato.');

    const restart = argv.restart as boolean;
    const only = argv.only as string;
    if (restart) {
        const restartCmd = ['cd', remoteDeployBasePath + ';', 'pm2', 'restart', '"' + remoteFilename + '"', '--update-env'];
        if (only) {
            restartCmd.push('--only');
            restartCmd.push(only);
            logger.info('Restart pm2/' + only + '...');
        } else {
            logger.info('Restart pm2 completo...');
        }

        await session.commandAs(nodeUser, restartCmd);
    } else {
        logger.warn('Restart non eseguito. Potrebbe essere necessaria una operazione manuale');
    }
    session.disconnect();
};

export default exec;