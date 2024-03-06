"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFullyPulled = void 0;
const logger_1 = require("../../../lib/logger");
const spawn_1 = require("../../../lib/spawn");
const types_1 = require("../../../types");
const prettyFormat_1 = require("./prettyFormat");
/**
 * Verifica se una branch è pullata completamente. Per farlo, verifica che l'hash di commit
 * in origin/branch (è quella sempre pushata) sia uguale a quello in branch locale (quella pullata).
 * Per essere pullata totalmente le due devono coincidere.
 * Se non è totalmente pullata, lancia eccezione con messaggio di errore.
 *
 * @param branchName Nome della branch. Non deve contenere "origin/". oppure "/local"
 * @returns Commit id HEAD della branch. Versione corta, solo i primi 8 caratteri.
 */
async function isFullyPulled(branchName) {
    // Ottengo head della branch e verifico che sia pullata
    const originBranchCommit = await (0, spawn_1.spawn)('git', ['log', '-1', 'origin/' + branchName, '--pretty=format:"%h"'], false);
    if (originBranchCommit.exitCode !== 0) {
        throw new types_1.StringError(`Branch ${branchName} non esiste`);
    }
    const localBranchCommit = await (0, spawn_1.spawn)('git', ['log', '-1', branchName, '--pretty=format:"%h"'], false);
    if (localBranchCommit.exitCode !== 0) {
        throw new types_1.StringError(`Branch ${branchName} non esiste`);
    }
    if (localBranchCommit.output.trim() !== originBranchCommit.output.trim()) {
        //Riprendo info su commit (piu dettagli stavolta) per mostrarli all'utente
        const localInfo = await (0, spawn_1.spawn)('git', ['log', '-1', branchName, prettyFormat_1.prettyFormat], false);
        const remoteInfo = await (0, spawn_1.spawn)('git', ['log', '-1', 'origin/' + branchName, prettyFormat_1.prettyFormat], false);
        logger_1.logger.log('Locale: ' + localInfo.output.trim());
        logger_1.logger.log('Remoto: ' + remoteInfo.output.trim());
        throw new types_1.StringError(`La branch "${branchName}" non è aggiornata. Fai git pull e riesegui il comando.`);
    }
    return localBranchCommit.output.replace(/"/g, '').trim();
}
exports.isFullyPulled = isFullyPulled;
//# sourceMappingURL=isFullyPulled.js.map