"use strict";
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