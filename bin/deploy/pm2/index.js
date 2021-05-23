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
const ssh = require('../../../lib/ssh');

module.exports.info = 'Utility deploy ecosystem.config.json su VM';
module.exports.help = [
    ['-restart', 'Ricarica pm2 al termine del deploy'],
    ['-only <name>', 'Ricarica solo l\'app specificata']
];

const appsContainer = '/apps/';

module.exports.cmd = async function (basepath, params, logger) {
    const target = await _target.get();
    _target.print(target);

    if (!target) return;

    const nodeUser = target.nodeUser || 'node';
    const filename = 'ecosystem.config.json';
    const ecosystemConfigJsonPath = path.join(process.cwd(), filename);

    if (!fs.existsSync(ecosystemConfigJsonPath)) {
        logger.error('Nessun ecosystem.config.json trovato in questa directory');
        return;
    }

    // just check json syntax
    try {
        const _discard = JSON.parse(fs.readFileSync(ecosystemConfigJsonPath).toString());
    } catch (error) {
        logger.error('Errore di sintassi nel file ' + filename);
        throw error;
    }
    const session = await ssh.createSshSession(target);

    const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';

    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteTmpPath = await session.getRemoteTmpDir(nodeUser, '.' + appsContainer);

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

    const restart = params.findIndex(p => p === '-restart') >= 0;
    const only = params.findIndex(p => p === '-only');
    if (restart) {
        const restartCmd = ['cd', remoteDeployBasePath + ';', pm2, 'restart', '"' + remoteFilename + '"', '--update-env'];
        if (only >= 0) {
            restartCmd.push('--only');
            restartCmd.push(params[only + 1]);
            logger.info('Restart pm2/' + params[only + 1] + '...');
        } else {
            logger.info('Restart pm2 completo...');
        }

        await session.commandAs(nodeUser, restartCmd);
    } else {
        logger.warn('Restart non eseguito. Potrebbe essere necessaria una operazione manuale');
    }
    session.disconnect();
};
