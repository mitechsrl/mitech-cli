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
const types_1 = require("../../../types");
const branchSelector_1 = require("../_lib/branchSelector");
const isFullyPulled_1 = require("../_lib/isFullyPulled");
const isFullyMerged_1 = require("../_lib/isFullyMerged");
const exec = async (argv) => {
    // Rimosso warning. Ho trovato il modo di fare la verifica di pull seriamente (vedi isFullyPulled)
    // logger.warn('ATTENZIONE: Verifica di aver eseguito pull sia di master che della branch interessata');
    // logger.warn('altrimenti i risultati possono essere errati!');
    let branchName = argv.b;
    // chiedi il nome branch nel caso non sia stata passata 
    if (!branchName)
        branchName = await (0, branchSelector_1.branchSelector)();
    // Ottengo head della branch e verifico che sia pullata
    const localBranchHEADCommit = await (0, isFullyPulled_1.isFullyPulled)(branchName);
    // becco il nome della branch master. Deve essere master o main
    const _masterBranch = await (0, spawn_1.spawn)('git', ['branch', '-l', 'main', 'master', '--format', '%(refname:short)'], false);
    const masterBranchName = _masterBranch.output.trim();
    if (!masterBranchName)
        throw new types_1.StringError('Non riesco a trovare il nome della branch master');
    if (branchName === masterBranchName)
        throw new types_1.StringError('Seleziona una branch diversa da ' + branchName);
    // Verifico che branchName sia completamente mergiata in masterBranchName
    const mergeCommitHash = await (0, isFullyMerged_1.isFullyMerged)(masterBranchName, branchName);
    // Tiro fuori piu info sulla commit di merge
    const mergeCommit = await (0, spawn_1.spawn)('git', ['log', '-1', mergeCommitHash], false);
    logger_1.logger.log('');
    logger_1.logger.success('La branch è completamente mergiata in ' + masterBranchName);
    logger_1.logger.log('');
    logger_1.logger.log('Commit di merge: ');
    logger_1.logger.log(mergeCommit.output);
    // Tiro fuori i tag che includono la branch. Per ora li stampo tutti, poi vediamo se è piu comodo avere "quello piu vecchio"
    // che include la branch
    const tagsIncludingCommit = await (0, spawn_1.spawn)('git', ['tag', '--contains', localBranchHEADCommit], false);
    logger_1.logger.log('Tags che includono la branch:');
    const paddedTags = tagsIncludingCommit.output.split('\n').map(s => s.trim());
    // trucco per stampare 4 tag per riga
    paddedTags.forEach((tag, i) => {
        if (i % 4 === 0)
            process.stdout.write('\n');
        process.stdout.write(tag.padEnd(25));
    });
    logger_1.logger.log('');
    logger_1.logger.log('');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map