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
const ssh = require('../../../../lib/ssh');
const logger = require('../../../../lib/logger');
const { uploadAndInstallDeployScript } = require('../../_lib/deployScript');

module.exports.info = [
    'Utility listing backup deploy app'
];
module.exports.help = [
];

module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);
    if (!target) return;

    const nodeUser = target.nodeUser || 'node';

    // connect to ssh remote target
    const session = await ssh.createSshSession(target);

    logger.info('Check environment...');

    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    logger.log('Eseguo listing directory backups');
    const backups = await deployScript.call(['-o', 'lsBackups'], false);
    console.log(backups);
    session.disconnect();
};
