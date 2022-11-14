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
const confirm_1 = require("../../../../lib/confirm");
const logger_1 = require("../../../../lib/logger");
const runTargetConfiguration_1 = require("../../../../lib/runTargetConfiguration");
const targets_1 = require("../../../../lib/targets");
const presetupCheckConfirm_1 = require("../../pre-setup/presetupCheckConfirm");
const exec = async (argv) => {
    logger_1.logger.warn('ATTENZIONE! Questa procedura configura un disco aggiuntivo NUOVO, ed esegue una FORMATTAZIONE del disco in questione. Non usare questa procedura per connettere un disco già popolato!!');
    if (!await (0, confirm_1.confirm)(argv, 'Continuare?')) {
        return;
    }
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    if (!target)
        return;
    // always make sure you can run sudo commands without entering password
    await (0, presetupCheckConfirm_1.presetupCheckConfirm)();
    await (0, runTargetConfiguration_1.runTargetConfiguration)(target, path_1.default.join(__dirname, './_configs'));
};
exports.default = exec;
//# sourceMappingURL=exec.js.map