/**
 * Verifica se branchName è completamente mergiata in branchMergedIntoName.
 * Se non lo è, lancia  eccezione
 * @param branchMergedIntoName
 * @param branchName
 * @param branchHEADCommit id commit HEAD di branch
 * @returns Commit id della commit in comune piu recente tra branchMergedIntoName e branchName
 */
export declare function isFullyMerged(branchMergedIntoName: string, branchName: string): Promise<string>;
