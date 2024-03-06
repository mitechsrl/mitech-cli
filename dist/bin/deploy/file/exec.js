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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../lib/logger");
const ssh_1 = require("../../../lib/ssh");
const targets_1 = require("../../../lib/targets");
const types_1 = require("../../../types");
const createPackage_1 = require("./_lib/createPackage");
const uuid_1 = require("uuid");
const deployScript_1 = require("../_lib/deployScript");
const confirm_1 = require("../../../lib/confirm");
const exec = async (argv) => {
    var _a;
    const target = await (0, targets_1.getTarget)();
    if (!target)
        return;
    (0, targets_1.printTarget)(target);
    const nodeUser = target.nodeUser || 'node';
    const sudoUser = target.username || 'azureuser';
    const toUpload = argv.s;
    if (!toUpload) {
        throw new types_1.StringError('Nessun file da caricare definito. Usa <-s fileOrPath>.');
    }
    if (!(0, fs_1.existsSync)(toUpload)) {
        throw new types_1.StringError('File o path sorgente ' + toUpload + ' inesistente');
    }
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    const remoteErase = path_1.default.relative('./', toUpload);
    const defaultDestination = await session.getRemoteHomeDir(nodeUser, 'apps');
    let destination = (_a = argv.d) !== null && _a !== void 0 ? _a : defaultDestination;
    if (!destination) {
        logger_1.logger.warn(`Destination dir non definita, uso il default ${defaultDestination}`);
        destination = defaultDestination;
    }
    // Conferma per essere sicuri
    if (!await (0, confirm_1.confirm)(argv, toUpload + ' verrà caricato sul target selezionato. Continuare?')) {
        logger_1.logger.error('Deploy abortito');
        return;
    }
    logger_1.logger.log(`Carico ${toUpload} in ${defaultDestination}`);
    // compress the cwd() folder
    const projectTar = await (0, createPackage_1.createPackage)(toUpload);
    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + (0, uuid_1.v4)() + '.tgz';
    // upload files
    logger_1.logger.info('Upload: ' + toUpload + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, nodeUser);
    // run the server deploy utility
    logger_1.logger.info('Copia files');
    await deployScript.call(['-o', 'files', '-e', remoteErase, '-d', destination, '-a', '"' + remoteTempFile + '"'], true);
    // questo command vuoto perchè c'era??
    // await session.commandAs(nodeUser);
    logger_1.logger.log('Deploy files terminato');
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map