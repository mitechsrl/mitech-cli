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
const confirm_1 = require("../../../lib/confirm");
const logger_1 = require("../../../lib/logger");
const ssh_1 = require("../../../lib/ssh");
const targets_1 = require("../../../lib/targets");
const appsContainer_1 = require("../_lib/appsContainer");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    if (!target)
        return;
    (0, targets_1.printTarget)(target);
    const nodeUser = target.nodeUser || 'node';
    let filename = 'ecosystem.config.json';
    let ecosystemConfigFilePath = path_1.default.join(process.cwd(), filename);
    if (!(0, fs_1.existsSync)(ecosystemConfigFilePath)) {
        filename = 'ecosystem.config.js';
        ecosystemConfigFilePath = path_1.default.join(process.cwd(), filename);
        if (!(0, fs_1.existsSync)(ecosystemConfigFilePath)) {
            logger_1.logger.error('Nessun ecosystem.config.js(on) trovato in questa directory');
            return;
        }
    }
    // just check js(on) syntax.
    // THis avoid uploading a broken file 
    try {
        if (ecosystemConfigFilePath.endsWith('.json')) {
            JSON.parse((0, fs_1.readFileSync)(ecosystemConfigFilePath).toString());
        }
        if (ecosystemConfigFilePath.endsWith('.js')) {
            require(ecosystemConfigFilePath);
        }
    }
    catch (error) {
        logger_1.logger.error('Errore di sintassi nel file ' + filename);
        throw error;
    }
    // ask for confirm
    if (!await (0, confirm_1.confirm)(argv, `Il file ${filename} verrà caricato sul target selezionato. Continuare?`)) {
        return;
    }
    const session = await (0, ssh_1.createSshSession)(target);
    const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer_1.appsContainer);
    const remoteTmpPath = await session.getRemoteTmpDir(nodeUser);
    const remoteTmpFilename = remoteTmpPath + filename;
    const remoteFilename = remoteDeployBasePath + filename;
    logger_1.logger.info('Upload: ' + filename + ' in ' + remoteFilename);
    if (session.os.linux) {
        await session.uploadFile(ecosystemConfigFilePath, remoteTmpFilename);
        await session.commandAs(nodeUser, ['cp', remoteTmpFilename, remoteFilename]);
        await session.command(['sudo chown ' + nodeUser + ':' + nodeUser, remoteFilename]);
        await session.command(['sudo chmod 700', remoteFilename]);
    }
    else {
        await session.uploadFile(ecosystemConfigFilePath, remoteFilename);
    }
    logger_1.logger.info('Upload completato.');
    const restart = argv.restart;
    const only = argv.only;
    if (restart) {
        const restartCmd = ['cd', remoteDeployBasePath + ';', pm2, 'restart', '"' + remoteFilename + '"', '--update-env'];
        if (only) {
            restartCmd.push('--only');
            restartCmd.push(only);
            logger_1.logger.info('Restart pm2/' + only + '...');
        }
        else {
            logger_1.logger.info('Restart pm2 completo...');
        }
        await session.commandAs(nodeUser, restartCmd);
    }
    else {
        logger_1.logger.warn('Restart non eseguito. Potrebbe essere necessaria una operazione manuale');
    }
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map