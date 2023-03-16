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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
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
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope);
    const npmParams = [
        'unpublish', packageName,
        '--userconfig', registry.npmrcPath,
        '--registry', registry.registry,
        '--access', 'restricted',
        '--force'
    ];
    logger_1.logger.log('Eseguo npm ' + npmParams.join(' '));
    const npmResult = await (0, spawn_1.spawn)(npm_1.npmExecutable, npmParams, true);
    if (npmResult.exitCode !== 0) {
        logger_1.logger.error('Unpublish fallito: exit code = ' + npmResult.exitCode);
        return;
    }
    logger_1.logger.info('Unpublish completo!');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map