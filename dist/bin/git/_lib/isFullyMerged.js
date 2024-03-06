"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFullyMerged = void 0;
const isFullyPulled_1 = require("./isFullyPulled");
const types_1 = require("../../../types");
const spawn_1 = require("../../../lib/spawn");
/**
 * Verifica se branchName è completamente mergiata in branchMergedIntoName.
 * Se non lo è, lancia  eccezione
 * @param branchMergedIntoName
 * @param branchName
 * @param branchHEADCommit id commit HEAD di branch
 * @returns Commit id della commit in comune piu recente tra branchMergedIntoName e branchName
 */
async function isFullyMerged(branchMergedIntoName, branchName) {
    // Verifico in primis che entrambe le branch siano totalmente pullate e prendo il loro id HEAD
    await (0, isFullyPulled_1.isFullyPulled)(branchMergedIntoName);
    const branchHEADCommit = await (0, isFullyPulled_1.isFullyPulled)(branchName);
    // prendo la commit in comune piu recente tra master e la branch di turno.
    // Se quella commit è anche la commit HEAD della branch, allora è totalmente mergiata (non ci sono
    // ulteriori commit da mergiare)
    const mergeCommitHash = await (0, spawn_1.spawn)('git', ['merge-base', branchMergedIntoName, branchName], false);
    // nota: mergeCommitHash.output è l'hash intero, per confrontare verifico che inizi per l'altro hash
    if (!mergeCommitHash.output.trim().startsWith(branchHEADCommit)) {
        throw new types_1.StringError(`La branch non è stata mergiata in ${branchName} oppure vi sono commit pendenti non mergiate`);
    }
    return mergeCommitHash.output.trim();
}
exports.isFullyMerged = isFullyMerged;
//# sourceMappingURL=isFullyMerged.js.map