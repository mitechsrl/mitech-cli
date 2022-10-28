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
const deployScript_1 = require("../../_lib/deployScript");
const createPackage_1 = require("./createPackage");
const uuid_1 = require("uuid");
const deployError_1 = require("./deployError");
const fatalError_1 = require("../../_lib/fatalError");
const backupFile_1 = require("../../_lib/backupFile");
const listUptimeChecks_1 = require("./listUptimeChecks");
const confirm_1 = require("../../../../lib/confirm");
/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */
async function deploy(target, params) {
    const returnValue = {
        aborted: false,
        complete: false
    };
    const nodeUser = target.nodeUser || 'node';
    const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    if (!(0, fs_1.existsSync)(packageJsonPath)) {
        throw new Error('Nessun package.json trovato in questa directory');
    }
    // verify validity of uptimecheck
    const uptimeCheck = params.c;
    let uptimeCheckFn = null;
    if (uptimeCheck) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            uptimeCheckFn = require(path_1.default.join(__dirname, './uptimeChecks', uptimeCheck + '.js')).default;
        }
        catch (e) {
            const checks = (0, listUptimeChecks_1.listUptimeChecks)();
            throw new types_1.StringError(`Unknown uptime check '${uptimeCheck}'. Available: ${checks}`);
        }
    }
    const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath).toString());
    let packageName = packageJson.name;
    if (packageName.split('/').length > 1) {
        packageName = packageName.split('/')[1];
    }
    if (!await (0, confirm_1.confirm)(params, packageJson.name + ' verrà deployato sul target selezionato. Continuare?')) {
        returnValue.aborted = true;
        return returnValue;
    }
    // compress the cwd() folder
    const projectTar = await (0, createPackage_1.createPackage)();
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + (0, uuid_1.v4)() + '.tgz';
    // upload files
    logger_1.logger.info('Upload: ' + packageName + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, nodeUser);
    // run the server deploy utility
    logger_1.logger.info('Eseguo deploy app...');
    const result = await deployScript.call(['-o', 'deploy', '-p', packageName, '-a', '"' + remoteTempFile + '"'], true);
    // Do we need to download the entire app backup?
    // If yes, check if we have a backup file and download it
    const downloadBackup = params.d;
    if (downloadBackup) {
        (0, backupFile_1.downloadBackupFile)(session, result.output);
    }
    // search and match the deploy error tag
    (0, deployError_1.throwOnDeployErrorError)(result.output);
    // search and match the generic fatal error tag error tag
    (0, fatalError_1.throwOnFatalError)(result.output);
    if (uptimeCheck && uptimeCheckFn) {
        logger_1.logger.log('Eseguo check uptime ' + uptimeCheck);
        await uptimeCheckFn(session, packageJson, result, target);
    }
    session.disconnect();
    returnValue.complete = true;
    return returnValue;
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map