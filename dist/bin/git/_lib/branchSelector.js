"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchSelector = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const spawn_1 = require("../../../lib/spawn");
const inquirer_autocomplete_prompt_1 = __importDefault(require("inquirer-autocomplete-prompt"));
/**
 * Display a inquirer prompt asking for a local repository branch
 * @returns
 */
async function branchSelector() {
    // chiedi il nome branch nel caso non sia stata passata 
    const _branches = await (0, spawn_1.spawn)('git', ['branch', '-a'], false);
    const branches = _branches.output.split('\n').map(l => {
        l = l.trim().replace(/^\* /, '');
        return l;
    }).filter(l => !!l);
    inquirer_1.default.registerPrompt('autocomplete', inquirer_autocomplete_prompt_1.default);
    const answers = await inquirer_1.default.prompt([{
            type: 'autocomplete',
            name: 'branchName',
            message: 'Seleziona nome branch da verificare',
            source: (answers, input = '') => {
                return branches.filter(b => b.indexOf(input) >= 0);
            }
        }]);
    return answers.branchName;
}
exports.branchSelector = branchSelector;
//# sourceMappingURL=branchSelector.js.map