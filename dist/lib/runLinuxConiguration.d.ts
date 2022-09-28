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
import { SshSession } from './ssh';
/**
  * funzione helper per eseguire configurazioni linux
  * Questa funzione si aspetta esista una directory configDirectory, che contenga la seguente struttura:
  *
  * configDir1
  *   - commands.js -> file che esporta una funzione da eseguire alla scelta di qeusta config
  *   - config.js -> esporta oggetto
  *     {
  *        name:string, // nome della modalità
  *        value: {
  *            questions:[array di questions inquirer], // array di voci inquirer da mostrare
  *            validateAnswers: (answers) => boolean // funzone validazione risposte. Throw in caso di errore
  *        }
  *     }
  * configDir[2,3,...N]
  *    - commands.js
  *    - config.js
  *
  * @param {*} session sessione ssh remota
  * @param {*} configDirectory config directory da scannerizzare alla ricerca di configurazioni
  * @returns
  */
export declare function runLinuxConfiguration(session: SshSession, configDirectory: string): Promise<any>;
