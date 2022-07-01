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

const _target = require('../../../../lib/target');
const path = require('path');
const ssh = require('../../../../lib/ssh');
const logger = require('../../../../lib/logger');
const { uploadAndInstallDeployScript } = require('../../_lib/uploadAndInstallDeployScript');

module.exports.info = [
    'Utility listing backup deploy app'
];
module.exports.help = [
];

const appsContainer = '/apps/';

module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);
    if (!target) return;

    const nodeUser = target.nodeUser || 'node';

    // connect to ssh remote target
    const session = await ssh.createSshSession(target);

    logger.info('Check environment...');

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';

    // upload script deploy
    await uploadAndInstallDeployScript(session,
        remoteTempDir,
        nodeUser,
        remoteDeployBasePath,
        remoteDeployInstructionsFile);

    logger.log('Eseguo listing directory backups');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'lsBackups']);

    session.disconnect();
};
