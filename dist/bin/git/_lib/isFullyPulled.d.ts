/**
 * Verifica se una branch è pullata completamente. Per farlo, verifica che l'hash di commit
 * in origin/branch (è quella sempre pushata) sia uguale a quello in branch locale (quella pullata).
 * Per essere pullata totalmente le due devono coincidere.
 * Se non è totalmente pullata, lancia eccezione con messaggio di errore.
 *
 * @param branchName Nome della branch. Non deve contenere "origin/". oppure "/local"
 * @returns Commit id HEAD della branch. Versione corta, solo i primi 8 caratteri.
 */
export declare function isFullyPulled(branchName: string): Promise<string>;
