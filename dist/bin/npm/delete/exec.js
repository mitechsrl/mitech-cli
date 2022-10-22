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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const logger_1 = require("../../../lib/logger");
const types_1 = require("../../../types");
const npmConstants_1 = require("../npmConstants");
const npm_1 = require("../../../lib/npm");
const spawn_1 = require("../../../lib/spawn");
const confirm_1 = require("../../../lib/confirm");
const path_1 = require("path");
const exec = async (argv) => {
    if (!argv.p) {
        throw new types_1.StringError('Specifica il pacchetto da rimuovere con "-p packageName"');
    }
    if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), 'package.json'))) {
        throw new types_1.StringError('Esegui questo comando in una cartella dove non è presente un file package.json!');
    }
    const packageName = argv.p;
    if (!await (0, confirm_1.confirm)(argv, 'Il pacchetto ' + packageName + ' verrà rimosso dal registry NPM Mitech. Sei sicuro?')) {
        return;
    }
    // creo un .npmrc se serve. Serve per far loggare npm in auto sul registry
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope);
    const npmrcPath = (0, path_1.join)(process.cwd(), './.npmrc');
    let deleteNpmRcFile = false;
    if (!(0, fs_1.existsSync)(npmrcPath)) {
        deleteNpmRcFile = true;
        fs_1.default.writeFileSync(npmrcPath, (0, npm_1.buildNpmrc)(registry));
    }
    const npmParams = ['unpublish', packageName, '--registry', registry.registry, '--access', 'restricted', '--force'];
    logger_1.logger.log('Eseguo npm ' + npmParams.join(' '));
    const npmResult = await (0, spawn_1.spawn)(npm_1.npmExecutable, npmParams, true);
    if (deleteNpmRcFile) {
        (0, fs_1.unlinkSync)(npmrcPath);
    }
    if (npmResult.exitCode !== 0) {
        logger_1.logger.error('Unpublish fallito: exit code = ' + npmResult.exitCode);
        return;
    }
    logger_1.logger.info('Unpublish completo!');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map