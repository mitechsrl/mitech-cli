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
const spawn_1 = require("../../../lib/spawn");
const branchSelector_1 = require("../_lib/branchSelector");
const prettyFormat_1 = require("../_lib/prettyFormat");
const exec = async (argv) => {
    let branchName = argv.b;
    // chiedi il nome branch nel caso non sia stata passata 
    if (!branchName) {
        branchName = await (0, branchSelector_1.branchSelector)();
    }
    const mergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--no-merged'], false);
    const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;
    if (!merged && !unmerged) {
        logger_1.logger.error('La branch specificata non esiste');
        return;
    }
    if (merged) {
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
            const commits = await (0, spawn_1.spawn)('git', ['log', '--no-merges', branchName, '^HEAD', prettyFormat_1.prettyFormat], false);
            commits.output.split('\n').forEach(l => {
                const _l = l.trim().substring(1);
                logger_1.logger.log(_l.substring(0, _l.length - 1));
            });
        }
    }
    else {
        logger_1.logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged... chiedi al cane, se abbaia due volte allora è merged.');
    }
    logger_1.logger.log('');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map