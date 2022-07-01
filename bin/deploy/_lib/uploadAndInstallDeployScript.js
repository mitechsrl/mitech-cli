const path = require('path');
const logger = require('../../../lib/logger');

module.exports.uploadAndInstallDeployScript = async (
    session,
    remoteTempDir,
    nodeUser,
    remoteDeployBasePath,
    remoteDeployInstructionsFile
) => {
    logger.info('Uploading deploy script...');

    const remoteDeployInstructionsPackageJson = remoteDeployBasePath + 'package.json';

    if (session.os.linux) {
        // on linux upload will store the files into tmp then copy them in their final position with the appropriate user.
        // this is to avoid permission problems between the uploading user and the target directory user.
        let _f = remoteTempDir.trim() + 'deploy-package.json';
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-package.json'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsPackageJson]);
        await session.command(['rm', _f]);

        _f = remoteTempDir.trim() + 'deploy-instructions.js';
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-instructions.js'), _f);
        await session.commandAs(nodeUser, ['cp', _f, remoteDeployInstructionsFile]);
        await session.command(['rm', _f]);
    } else {
        // on other platforms (read as: windows) the upload store the files directly in their final position
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-package.json'), remoteDeployInstructionsPackageJson);
        await session.uploadFile(path.join(__dirname, '../_instructions/deploy-instructions.js'), remoteDeployInstructionsFile);
    }

    // run the server deploy utility
    logger.info('Installo deploy script...');
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'install']);
};
