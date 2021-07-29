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
    const _remoteTempFile = await session.getRemoteTmpDir(nodeUser);
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';
    const remoteDeployInstructionsPackageJson = remoteDeployBasePath + 'package.json';

    logger.info('Upload: deploy-instructions.js');
    if (session.os.linux) {
        // on linux upload will store the files into tmp then copy them in their final position with the appropriate user.
        // this is to avoid permission problems between the uploading user and the target directory user.
        let _f = _remoteTempFile.trim() + 'deploy-package.json';
        await session.uploadFile(path.join(__dirname, '../../_instructions/deploy-package.json'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsPackageJson]);
        await session.command(['rm', _f]);

        _f = _remoteTempFile.trim() + 'deploy-instructions.js';
        await session.uploadFile(path.join(__dirname, '../../_instructions/deploy-instructions.js'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsFile]);
        await session.command(['rm', _f]);
    } else {
        // on other platforms (read as: windows) the upload store the files directly in their final position
        await session.uploadFile(path.join(__dirname, '../../_instructions/deploy-package.json'), remoteDeployInstructionsPackageJson);
        await session.uploadFile(path.join(__dirname, '../../_instructions/deploy-instructions.js'), remoteDeployInstructionsFile);
    }

    // run the server deploy utility
    logger.info('Run deploy-instructions.js');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'install']);

    logger.log('Eseguo listing directory backups');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'lsBackups']);

    session.disconnect();
};
