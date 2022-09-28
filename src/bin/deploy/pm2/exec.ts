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
    const filename = 'ecosystem.config.json';
    const ecosystemConfigJsonPath = path.join(process.cwd(), filename);

    if (!existsSync(ecosystemConfigJsonPath)) {
        logger.error('Nessun ecosystem.config.json trovato in questa directory');
        return;
    }

    // just check json syntax
    try {
        JSON.parse(readFileSync(ecosystemConfigJsonPath).toString());
    } catch (error) {
        logger.error('Errore di sintassi nel file ' + filename);
        throw error;
    }
    const session = await createSshSession(target);

    const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';

    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteTmpPath = await session.getRemoteTmpDir(nodeUser);

    const remoteTmpFilename = remoteTmpPath + filename;
    const remoteFilename = remoteDeployBasePath + filename;

    logger.info('Upload: ' + filename + ' in ' + remoteFilename);

    if (session.os.linux) {
        await session.uploadFile(ecosystemConfigJsonPath, remoteTmpFilename);
        await session.commandAs(nodeUser, ['cp', remoteTmpFilename, remoteFilename]);
        await session.command(['sudo chown ' + nodeUser + ':' + nodeUser, remoteFilename]);
        await session.command(['sudo chmod 700', remoteFilename]);
    } else {
        await session.uploadFile(ecosystemConfigJsonPath, remoteFilename);
    }

    logger.info('Upload completato.');

    const restart = argv.restart as boolean;
    const only = argv.only as string;
    if (restart) {
        const restartCmd = ['cd', remoteDeployBasePath + ';', pm2, 'restart', '"' + remoteFilename + '"', '--update-env'];
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