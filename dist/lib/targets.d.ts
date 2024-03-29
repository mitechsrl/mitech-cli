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
import { SshTarget } from '../types';
/**
 * DEcode the target password if needed
 * @param {*} target
 */
export declare function decodeTarget(target: SshTarget): SshTarget;
/**
 * Seleziona un target dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico target disponibile se la lista è composta da un solo target
 * @returns
 */
export declare function getTarget(argv?: yargs.ArgumentsCamelCase<unknown>): Promise<SshTarget>;
/**
 * Stampa il target selezionato
 *
 * @param {*} target
 */
export declare function printTarget(target: SshTarget): void;
