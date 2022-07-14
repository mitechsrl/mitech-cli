const path = require('path');
const logger = require('../../../lib/logger');
const { appsContainer } = require('./appsContainer');
const fs = require('fs');

/**
 * Upload the deploy script and return a helper object to call it.
 *
 * @param {*} session ssh session
 * @param {*} nodeUser User for which script must be run
 * @returns
 *  {call: async ([params], print) => Promise<string>}
 *  call: A proxy function to call the deploy script with the provided parameters.
 *        To know the parameters, see ./_instructions/deploy_instructions.js (at the end of file)
 */
module.exports.uploadAndInstallDeployScript = async (session, nodeUser) => {
    logger.info('Upload e preparazione deploy script...');

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';

    const files = await fs.promises.readdir(path.join(__dirname, '../_instructions/'));
    if (session.os.linux) {
        // on linux upload will store the files into tmp then copy them in their final position with the appropriate user.
        // this is to avoid permission problems between the uploading user and the target directory user.
        for (const file of files) {
            const _f = remoteTempDir.trim() + file;
            await session.uploadFile(path.join(__dirname, '../_instructions/', file), _f);
            await session.commandAs(nodeUser, ['cp', _f, remoteDeployBasePath + file]);
            await session.command(['rm', _f]);
        }
    } else {
        throw new Error('Implementazione per NON linux ancante');
        // on other platforms (read as: windows) the upload store the files directly in their final position
        // await session.uploadFile(path.join(__dirname, '../_instructions/deploy-package.json'), remoteDeployInstructionsPackageJson);
        // await session.uploadFile(path.join(__dirname, '../_instructions/deploy-instructions.js'), remoteDeployInstructionsFile);
    }

    // install the dependencies for the deploy script
    await session.commandAs(nodeUser, ['node', remoteDeployInstructionsFile, '-o', 'install'], false);

    return {
        /**
         * Run the remote deploy script
         * @param {*} args un script parameters
         * @param {*} print Print command output. False by default
         * @returns A promise
         */
        call: async (args, print = false) => {
            const parts = ['node', remoteDeployInstructionsFile, ...args];
            return session.commandAs(nodeUser, parts, print);
        }
    };
};
