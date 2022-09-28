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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../lib/logger");
const ssh_1 = require("../../../lib/ssh");
const targets_1 = require("../../../lib/targets");
const types_1 = require("../../../types");
const exec = async (argv) => {
    const remoteFile = argv.s;
    const destinationfile = argv.d;
    if (!remoteFile) {
        throw new types_1.StringError('Nessun file specificato. Usa -s per specificare il path del file sul sistema remoto');
    }
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    let fileName = path_1.default.basename(remoteFile);
    if (destinationfile) {
        fileName = path_1.default.join(destinationfile, fileName);
    }
    logger_1.logger.log('Scarico ' + remoteFile);
    const start = new Date();
    await session.downloadFile(remoteFile, fileName);
    const end = new Date();
    const stats = fs_1.default.statSync(fileName);
    logger_1.logger.log('Download completato, ' + (stats.size / (1024 * 1024)).toFixed(2) + ' Mb in ' + ((end.getTime() - start.getTime()) / 1000).toFixed(0) + ' sec');
    logger_1.logger.log('File destinazione: ' + fileName);
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map