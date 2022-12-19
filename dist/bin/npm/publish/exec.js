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
const confirm_1 = require("../../../lib/confirm");
const spawn_1 = require("../../../lib/spawn");
const exec = async (argv) => {
    /* step 1 ************************************************************************/
    logger_1.logger.log('Directory corrente: ' + process.cwd());
    const registryIdParam = argv.r;
    /* step 1 ************************************************************************/
    logger_1.logger.log('verifico package.json...');
    let packageJson = null;
    try {
        packageJson = JSON.parse(fs_1.default.readFileSync('package.json').toString());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw new types_1.StringError('Errore lettura package.json: ' + e.message);
    }
    if (!packageJson.name.startsWith(npmConstants_1.npmScope + '/')) {
        throw new Error('Il pacchetto deve essere sotto scope @mitech. Rinominalo in @mitech/' + packageJson.name);
    }
    // conferma
    if (!await (0, confirm_1.confirm)(argv, 'Questa directory verrà pushata sul registry NPM. Sei sicuro di essere nella directory corretta?')) {
        return;
    }
    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope, registryIdParam, true);
    /* step 2 ************************************************************************/
    logger_1.logger.log('Preparo .npmrc...');
    if (fs_1.default.existsSync('.npmrc')) {
        fs_1.default.renameSync('.npmrc', '.npmrc-BACKUP');
    }
    fs_1.default.writeFileSync('.npmrc', (0, npm_1.buildNpmrc)(registry));
    const registryUrl = registry.registry;
    /* step 3 ************************************************************************/
    /*
    IV: 19-12-2022 Per via di
        https://medium.com/@jdxcode/for-the-love-of-god-dont-use-npmignore-f93c08909d8d
        cerco di deprecare l'uso di npmignore.
        I progetti che lo usano coninuno ad averlo finchè il dev non lo gestisce in alto modo,
        ma se non c'è non viene icreato.
        NOTA: contestualmente l'uso di "files" in package.json riduce i files pacchettizzati
    */
    try {
        if (fs_1.default.existsSync('.npmignore')) {
            logger_1.logger.log('Update .npmignore...');
            // .npmignore esiste già. Ci metto dentro .npmrc in modo da non spararlo sul registry
            let npmignore = fs_1.default.readFileSync('.npmignore').toString();
            const haveIgnore = npmignore.split('\n').map(r => r.trim()).filter(r => r === '.npmrc').length > 0;
            if (!haveIgnore) {
                npmignore = npmignore + '\n.npmrc\n.npmrc-BACKUP';
                fs_1.default.writeFileSync('.npmignore', npmignore);
            }
        }
    }
    catch (e) {
        throw new types_1.StringError('Update .npmignore fallito: ' + e.message);
    }
    /* step 3 ************************************************************************/
    // eseguo comando
    const result = await (0, spawn_1.spawn)(npm_1.npmExecutable, ['publish', '--registry', registryUrl, '--access', 'restricted'], true);
    if (fs_1.default.existsSync('.npmrc')) {
        // rimuovo il file .npmrc. Non serve oltre l'operazione npm
        fs_1.default.unlinkSync('.npmrc');
    }
    if (fs_1.default.existsSync('.npmrc-BACKUP')) {
        fs_1.default.renameSync('.npmrc-BACKUP', '.npmrc');
    }
    if (result.exitCode === 0) {
        logger_1.logger.info('Publish completo!');
    }
    else {
        logger_1.logger.log('');
        logger_1.logger.error('Publish fallito: exit code = ' + result.exitCode);
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map