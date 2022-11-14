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
 * Carica uno script sh su server remoto
 *
 * @param {*} session sessione ssh
 * @param {string} srcFile path file da caricare su disco locale
 * @param {string} dstFile path dove piazzare il file su server remoto
 */
export async function uploadShfile (session: SshSession, srcFile: string, dstFile:string) {
    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    await session.uploadFile(srcFile, dstFile);
    // passo dos2unix per evitare problemi coding windows
    await session.command('dos2unix ' + dstFile);
    // eseguo setup.sh sul server
    await session.command('sudo chmod +x ' + dstFile);
}

/**
 * Carica e esegue uno script sh su server remoto
 *
 * @param {*} session sessione ssh
 * @param {string} srcFile path file da caricare su disco locale
 * @param {string} dstFile path dove piazzare if file su server remoto. Deve essere path assoluto.
 * @param {string[]} params parametri di esecuzione script su server remoto
 */
export async function uploadAndRunShFile (session:SshSession, srcFile: string, dstFile:string, params:string[] = []){
    await uploadShfile(session, srcFile, dstFile);
    const _p = params.length === 0 ? '' : (' ' + params.join(' '));
    return await session.command('sudo ' + dstFile + _p);
}