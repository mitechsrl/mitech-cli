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
const logger_1 = require("../../../lib/logger");
const npm_1 = require("../../../lib/npm");
const exec = async (argv) => {
    const registries = (0, npm_1.getNpmPersistent)();
    if (registries.length === 0) {
        logger_1.logger.log('Non sono presenti regisrty npm. Use <mitech npm registry add> per creare uno');
        return;
    }
    logger_1.logger.log('');
    registries.forEach(element => {
        logger_1.logger.info('ID: ' + element.id);
        logger_1.logger.log('  scope: ' + element.scope);
        logger_1.logger.log('  registry: ' + element.registry);
        logger_1.logger.log('');
    });
};
exports.default = exec;
//# sourceMappingURL=exec.js.map