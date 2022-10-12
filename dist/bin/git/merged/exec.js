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
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../../../lib/logger");
const spawn_1 = require("../../../lib/spawn");
const inquirer_autocomplete_prompt_1 = __importDefault(require("inquirer-autocomplete-prompt"));
const exec = async (argv) => {
    let branchName = argv.b;
    if (!branchName) {
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
        branchName = answers.branchName;
    }
    const mergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--no-merged'], false);
    const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;
    if (!merged && !unmerged) {
        logger_1.logger.error('La branch specificata non esiste');
        return;
    }
    /* Non sembra funzionare

    if (merged && unmerged) {
        const count = await spawn('git', ['rev-list', '--count', branchName, '^HEAD'], false);
        logger.warn(`La branch è stata mergiata in precedenza, ma presenta ${count.data.trim()} commit recenti non mergiate.`);
        logger.log('');
        logger.log('Commit non mergiate: ');

        const commits = await spawn('git', ['log', '--no-merges', branchName, '^HEAD', '--pretty=format:"%h - %s - %ad"'], false);
        logger.log(commits.data);
    } else */ if (merged) {
        const mergeHash = await (0, spawn_1.spawn)('git', ['merge-base', 'HEAD', branchName], false);
        logger_1.logger.info('La branch è stata mergiata in precedenza ed è aggiornata, non devi fare nulla. Commit di merge: ' + mergeHash.output.trim());
        const log = await (0, spawn_1.spawn)('git', ['log', '-1', mergeHash.output.trim()], false);
        logger_1.logger.log('');
        logger_1.logger.log(log.output);
    }
    else if (unmerged) {
        logger_1.logger.error('La branch NON è stata mergiata');
        // is unmerged now, but check if it was unmerged also in the past
        const count = await (0, spawn_1.spawn)('git', ['rev-list', '--count', branchName, '^HEAD'], false);
        if (parseInt(count.output.trim()) >= 0) {
            logger_1.logger.log('Commit pendenti non mergiate: ');
            const commits = await (0, spawn_1.spawn)('git', ['log', '--no-merges', branchName, '^HEAD', '--pretty=format:"%h - %s - %ad"'], false);
            logger_1.logger.log(commits.output);
        }
    }
    else {
        logger_1.logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged... chiedi al cane, se abbaia due volte allora è merged.');
    }
    logger_1.logger.log('');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map