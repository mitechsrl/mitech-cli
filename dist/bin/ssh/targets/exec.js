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
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../../../lib/logger");
const mitechCliFile_1 = require("../../../lib/mitechCliFile");
const exec = async (argv) => {
    var _a;
    const mitechCliFile = await (0, mitechCliFile_1.getMitechCliFile)();
    const targets = (_a = mitechCliFile.content.targets) !== null && _a !== void 0 ? _a : [];
    if (!targets || targets.length === 0) {
        return logger_1.logger.error('Nessuna lista target disponibile in questa posizione');
    }
    logger_1.logger.log('');
    logger_1.logger.info('File: ' + mitechCliFile.file);
    logger_1.logger.log('');
    targets.forEach(target => {
        logger_1.logger.info(target.name);
        logger_1.logger.log(JSON.stringify(lodash_1.default.omit(target, ['name', 'password']), null, 4));
    });
};
exports.default = exec;
//# sourceMappingURL=exec.js.map