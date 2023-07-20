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
    try {
        // Just check for file malformations. Stop deploy in this case!
        const dcf = (0, fs_1.readFileSync)(dockerComposeFile).toString();
        (0, yaml_1.parse)(dcf);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw new types_1.StringError('File ' + dockerComposeFileName + ' malformato: ' + e.message);
    }
    const appUser = target.nodeUser || 'onit';
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    // tmp filenames for upload
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteTempFile = remoteTempDir.trim() + dockerComposeFileName;
    // Final compose file position
    const remoteDockerComposeFileName = `/home/${appUser}/apps/${dockerComposeFileName}`;
    // upload files
    logger_1.logger.info('Upload ' + dockerComposeFileName);
    await session.uploadFile(dockerComposeFile, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);
    // Reload docker compose
    await session.command(`cd /home/${appUser}/apps/; sudo /usr/bin/docker compose up -d --remove-orphans`);
    session.disconnect();
    return {
        complete: true
    };
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map