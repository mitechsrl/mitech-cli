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
const checkProperties_1 = require("./checkProperties");
/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */
async function deploy(target, params) {
    var _a, _b, _c;
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
    (0, checkProperties_1.checkProperties)(dockerComposeConfig);
    // ask the user which service to launch/rollout
    const answers = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'service',
            message: 'Service docker',
            choices: [{ name: 'Tutti', value: '_all_' }, ...Object.keys((_a = dockerComposeConfig.services) !== null && _a !== void 0 ? _a : {}).map(v => ({ name: v, value: v }))]
        }]);
    let image = '';
    let allImages = false; // Bota sœ tot!
    if (answers.service === '_all_') {
        allImages = true;
        console.warn('ATTENZIONE: L\'update di tutte le app NON prevede zero downtime.');
    }
    else {
        image = dockerComposeConfig.services[answers.service].image;
        if (!image)
            throw new Error('Unknown image');
    }
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
    let deployParams = [];
    if (!allImages) {
        // custom flag to trigger image validation via notation
        // Expected the server to already have a valid notation setup
        const verifyImage = (_b = dockerComposeConfig.services[answers.service]['x-verify-image']) !== null && _b !== void 0 ? _b : false;
        // Custom flag to enable zero downtime rollout
        const zeroDowntimeRollout = (_c = dockerComposeConfig.services[answers.service]['x-zero-downtime']) !== null && _c !== void 0 ? _c : false;
        if (zeroDowntimeRollout) {
            // use the server-side node script to effectively perform the service rollout
            logger_1.logger.info('Eseguo rollout');
            // rollout with zero downtime
            deployParams = ['-o', 'docker-rollout'];
        }
        else {
            // update with downtime
            logger_1.logger.info('Eseguo update');
            deployParams = ['-o', 'docker-update'];
        }
        deployParams.push(...['-s', `"${answers.service}"`]);
        if (verifyImage)
            deployParams.push(...['--verify-image', image]);
    }
    else {
        // NOTE: Verification not implemented for full update
        // update with downtime
        logger_1.logger.info('Eseguo update completo');
        deployParams = ['-o', 'full-docker-update'];
    }
    const result = await deployScript.call(deployParams, true);
    // throw on deployScript call error
    (0, fatalError_1.throwOnFatalError)(result.output);
    session.disconnect();
    return {
        complete: true
    };
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map