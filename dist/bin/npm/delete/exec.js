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
const types_1 = require("../../../types");
const npmConstants_1 = require("../npmConstants");
const npm_1 = require("../../../lib/npm");
const inquirer_1 = __importDefault(require("inquirer"));
const child_process_1 = require("child_process");
const exec = async (argv) => {
    if (!argv.p) {
        throw new types_1.StringError('Specifica il pacchetto da rimuovere con "-p packageName"');
    }
    const packageName = argv.p;
    try {
        const response = await inquirer_1.default.prompt({
            type: 'confirm',
            name: 'value',
            message: 'Il pacchetto ' + packageName + ' verrà rimosso dal registry NPM Mitech. Sei sicuro? '
        });
        if (!response.value)
            return;
    }
    catch (e) {
        return;
    }
    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope);
    fs_1.default.writeFileSync('.npmrc', (0, npm_1.buildNpmrc)(registry));
    const registryUrl = registry.registry;
    /* eseguo comando ************************************************************************/
    const npmParams = ['unpublish', packageName, '--registry', registryUrl, '--access', 'restricted', '--force'];
    logger_1.logger.log('Eseguo npm ' + npmParams.join(' '));
    const npm = (0, child_process_1.spawn)(npm_1.npmExecutable, npmParams, { stdio: 'inherit' });
    npm.on('error', (data) => {
        console.log(`error: ${data}`);
    });
    npm.on('exit', (code) => {
        try {
            // rimuovo il file .npmrc. Non serve oltre l'operazione npm
            // fs.unlinkSync('.npmrc');
        }
        catch (e) { }
        if (code === 0) {
            logger_1.logger.info('Unpublish completo!');
        }
        else {
            logger_1.logger.log('');
            logger_1.logger.error('Unpublish fallito: exit code = ' + code);
        }
    });
};
exports.default = exec;
//# sourceMappingURL=exec.js.map