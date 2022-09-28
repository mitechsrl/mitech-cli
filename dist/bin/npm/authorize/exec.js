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
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../lib/logger");
const npmConstants_1 = require("../npmConstants");
const npm_1 = require("../../../lib/npm");
const exec = async (argv) => {
    logger_1.logger.log('Directory corrente: ' + process.cwd());
    logger_1.logger.log('Preparo .npmrc...');
    logger_1.logger.log('uso account  \'readonlyAccount\'');
    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope);
    fs_1.default.writeFileSync('.npmrc', (0, npm_1.buildNpmrc)(registry, 'readonlyAccount'));
    logger_1.logger.log('File .npmrc creato!');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map