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

import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { CommandExecFunction } from '../../../types';
import { branchSelector } from '../_lib/branchSelector';
import { prettyFormat } from '../_lib/prettyFormat';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    
    let branchName: string = argv.b as string;
    // chiedi il nome branch nel caso non sia stata passata 
    if (!branchName) {
        branchName = await branchSelector();
    }

    const mergedBranchList = await spawn('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await spawn('git', ['branch', '-a', '--no-merged'], false);
    const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;

    if (!merged && !unmerged) {
        logger.error('La branch specificata non esiste');
        return;
    }
    
    if (merged) {
        const mergeHash = await spawn('git', ['merge-base', 'HEAD', branchName], false);
        logger.info('La branch è stata mergiata in precedenza ed è aggiornata, non devi fare nulla. Commit di merge: ' + mergeHash.output.trim());
        const log = await spawn('git', ['log', '-1', mergeHash.output.trim()], false);
        logger.log('');
        logger.log(log.output);
    } else if (unmerged) {
        logger.error('La branch NON è stata mergiata');
        // is unmerged now, but check if it was unmerged also in the past
        const count = await spawn('git', ['rev-list', '--count', branchName, '^HEAD'], false);
        if (parseInt(count.output.trim()) >= 0) {
            logger.log('Commit pendenti non mergiate: ');
            const commits = await spawn('git', ['log', '--no-merges', branchName, '^HEAD', prettyFormat], false);
            commits.output.split('\n').forEach(l => {
                const _l = l.trim().substring(1);
                logger.log(_l.substring(0, _l.length-1));
            });
        }
    } else {
        logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged... chiedi al cane, se abbaia due volte allora è merged.');
    }

    logger.log('');
};

export default exec;