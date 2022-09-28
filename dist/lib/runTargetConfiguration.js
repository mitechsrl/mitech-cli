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
exports.runTargetConfiguration = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const runLinuxConiguration_1 = require("./runLinuxConiguration");
const ssh_1 = require("./ssh");
/**
 * Seleziona una configurazione dalla directory configPaths e la esegue su target remoto
 * @param {*} target target remoto
 * @param {*} configPaths directory dove cercare le configurazioni
 */
async function runTargetConfiguration(target, configPaths) {
    let session = null;
    try {
        session = await (0, ssh_1.createSshSession)(target);
        if (session.os.linux) {
            await (0, runLinuxConiguration_1.runLinuxConfiguration)(session, path_1.default.join(configPaths, './linux'));
        }
        else {
            throw new Error('Setup script non disponibile per la piattaforma ' + JSON.stringify(session.os));
        }
    }
    catch (error) {
        logger_1.logger.error(error);
    }
    if (session)
        session.disconnect();
}
exports.runTargetConfiguration = runTargetConfiguration;
//# sourceMappingURL=runTargetConfiguration.js.map