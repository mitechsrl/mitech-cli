"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetupCheckConfirm = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../../../types");
async function presetupCheckConfirm() {
    const answers = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Hai verificato la compatibilità del setup con <mitech vm pre-setup>?'
        }]);
    if (answers.confirm !== true) {
        throw new types_1.StringError('Verifica prima la compatibilità.');
    }
}
exports.presetupCheckConfirm = presetupCheckConfirm;
//# sourceMappingURL=presetupCheckConfirm.js.map