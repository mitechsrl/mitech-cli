import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { StringError } from '../../../types';
import { prettyFormat } from './prettyFormat';

/**
 * Verifica se una branch è pullata completamente. Per farlo, verifica che l'hash di commit 
 * in origin/branch (è quella sempre pushata) sia uguale a quello in branch locale (quella pullata).
 * Per essere pullata totalmente le due devono coincidere.
 * Se non è totalmente pullata, lancia eccezione con messaggio di errore.
 * 
 * @param branchName Nome della branch. Non deve contenere "origin/". oppure "/local"
 * @returns Commit id HEAD della branch. Versione corta, solo i primi 8 caratteri.
 */
export async function isFullyPulled(branchName:string){
    // Ottengo head della branch e verifico che sia pullata
    const originBranchCommit = await spawn('git', ['log', '-1', 'origin/'+branchName, '--pretty=format:"%h"'], false);
    if (originBranchCommit.exitCode !== 0){
        throw new StringError(`Branch ${branchName} non esiste`);
    }
    const localBranchCommit = await spawn('git', ['log', '-1', branchName, '--pretty=format:"%h"'], false);
    if (localBranchCommit.exitCode !== 0){
        throw new StringError(`Branch ${branchName} non esiste`);
    }
    if (localBranchCommit.output.trim() !== originBranchCommit.output.trim()){
        //Riprendo info su commit (piu dettagli stavolta) per mostrarli all'utente
        const localInfo = await spawn('git', ['log', '-1', branchName, prettyFormat], false);
        const remoteInfo = await spawn('git', ['log', '-1', 'origin/'+branchName, prettyFormat], false);
        logger.log('Locale: '+localInfo.output.trim());
        logger.log('Remoto: '+remoteInfo.output.trim());

        throw new StringError(`La branch "${branchName}" non è aggiornata. Fai git pull e riesegui il comando.`);
    }

    return localBranchCommit.output.replace(/"/g, '').trim();
}