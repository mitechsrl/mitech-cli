"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../../lib/logger");
const ssh_1 = require("../../../../lib/ssh");
const types_1 = require("../../../../types");
const yaml_1 = require("yaml");
const deployScript_1 = require("../../_lib/deployScript");
const fatalError_1 = require("../../_lib/fatalError");
const validateComposeConfig_1 = require("./validateComposeConfig");
const mitechCliFile_1 = require("../../../../lib/mitechCliFile");
const runCommands_1 = require("../../../../lib/runCommands");
async function uploadDockerComposeFile(session, appUser, localDockerComposeFilePath, dockerComposeFileName) {
    // path for filenames used during compose file upload
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteTempFile = remoteTempDir.trim() + dockerComposeFileName;
    const remoteDockerComposeFileName = `/home/${appUser}/apps/${dockerComposeFileName}`;
    logger_1.logger.info('Upload ' + dockerComposeFileName);
    await session.uploadFile(localDockerComposeFilePath, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);
}
/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */
async function deploy(target, params) {
    const dockerComposeFileName = 'docker-compose.yml';
    const dockerComposeFile = path_1.default.join(process.cwd(), dockerComposeFileName);
    if (!(0, fs_1.existsSync)(dockerComposeFile)) {
        throw new types_1.StringError('Nessun file ' + dockerComposeFileName + ' trovato in questa directory.');
    }
    let dockerComposeConfig = {};
    try {
        // Just check for file malformations. Stop deploy in this case!
        dockerComposeConfig = (0, yaml_1.parse)((0, fs_1.readFileSync)(dockerComposeFile).toString());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw new types_1.StringError('File ' + dockerComposeFileName + ' malformato: ' + e.message);
    }
    // Check file for properties correctness
    (0, validateComposeConfig_1.validateComposeConfig)(dockerComposeConfig);
    const appUser = target.nodeUser || 'onit';
    const mitechCliFile = await (0, mitechCliFile_1.getMitechCliFile)();
    await (0, runCommands_1.askAndRunCommands)('Seleziona le operazioni da eseguire prima del deploy:', mitechCliFile.content.beforeDeploySteps);
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, appUser);
    // Upload the docker-compose file to server and place it in correct position
    await uploadDockerComposeFile(session, appUser, dockerComposeFile, dockerComposeFileName);
    // Call the deploy script on server to perform all the needed operations.
    // This run the docker swarm deploy using the docker-compose file uploaded before, which is expected to be in correct position
    const result = await deployScript.call(['-o', 'deploy-docker-swarm'], true);
    // throw on deployScript call error
    (0, fatalError_1.throwOnFatalError)(result.output);
    session.disconnect();
    return {
        complete: true
    };
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map