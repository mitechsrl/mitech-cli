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
import { MitechCliFileContentDb } from '../types';
export declare const SUPPORTED_TYPES: string[];
/**
 * Seleziona un database dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico database disponibile se la lista è composta da un solo database
 * @returns
 */
export declare function getDatabase(): Promise<MitechCliFileContentDb>;
/**
 * Stampa il database selezionato
 *
 * @param {*} database
 */
export declare function printDatabase(database: MitechCliFileContentDb): void;
