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
const runTargetConfiguration_1 = require("../../../../lib/runTargetConfiguration");
const targets_1 = require("../../../../lib/targets");
const presetupCheckConfirm_1 = require("../../pre-setup/presetupCheckConfirm");
const exec = async (argv) => {
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