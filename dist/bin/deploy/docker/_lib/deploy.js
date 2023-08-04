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
const inquirer_1 = __importDefault(require("inquirer"));
const fatalError_1 = require("../../_lib/fatalError");
/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */
async function deploy(target, params) {
    var _a;
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
    // ask the user which service to launch/rollout
    const answers = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'service',
            message: 'Service docker',
            choices: Object.keys((_a = dockerComposeConfig.services) !== null && _a !== void 0 ? _a : {})
        }]);
    const appUser = target.nodeUser || 'onit';
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, appUser);
    // path for filenames used during compose file upload
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteTempFile = remoteTempDir.trim() + dockerComposeFileName;
    const remoteDockerComposeFileName = `/home/${appUser}/apps/${dockerComposeFileName}`;
    logger_1.logger.info('Upload ' + dockerComposeFileName);
    await session.uploadFile(dockerComposeFile, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);
    // use the server-side node script to effectively perform the service rollout
    logger_1.logger.info('Eseguo rollout');
    const result = await deployScript.call(['-o', 'docker-rollout', '-s', `"${answers.service}"`], true);
    // await session.command(`cd /home/${appUser}/apps/; sudo /usr/bin/docker compose up -d --remove-orphans`);
    // throw on deployScript call error
    (0, fatalError_1.throwOnFatalError)(result.output);
    session.disconnect();
    return {
        complete: true
    };
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map