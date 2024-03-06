
import { isFullyPulled } from './isFullyPulled';
import { StringError } from '../../../types';
import { spawn } from '../../../lib/spawn';

/**
 * Verifica se branchName è completamente mergiata in branchMergedIntoName.
 * Se non lo è, lancia  eccezione
 * @param branchMergedIntoName 
 * @param branchName 
 * @param branchHEADCommit id commit HEAD di branch
 * @returns Commit id della commit in comune piu recente tra branchMergedIntoName e branchName
 */
export async function isFullyMerged(branchMergedIntoName:string, branchName:string){   

    // Verifico in primis che entrambe le branch siano totalmente pullate e prendo il loro id HEAD
    
    await isFullyPulled(branchMergedIntoName);
    const branchHEADCommit = await isFullyPulled(branchName);

    // prendo la commit in comune piu recente tra master e la branch di turno.
    // Se quella commit è anche la commit HEAD della branch, allora è totalmente mergiata (non ci sono
    // ulteriori commit da mergiare)
    const mergeCommitHash = await spawn('git', ['merge-base', branchMergedIntoName, branchName], false);
    // nota: mergeCommitHash.output è l'hash intero, per confrontare verifico che inizi per l'altro hash
    if (!mergeCommitHash.output.trim().startsWith(branchHEADCommit)){
        throw new StringError(`La branch non è stata mergiata in ${branchName} oppure vi sono commit pendenti non mergiate`);
    }

    return mergeCommitHash.output.trim();
}