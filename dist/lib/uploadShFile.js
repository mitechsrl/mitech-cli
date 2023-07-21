"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAndRunShFile = exports.uploadShfile = void 0;
/**
 * Carica uno script sh su server remoto
 *
 * @param {*} session sessione ssh
 * @param {string} srcFile path file da caricare su disco locale
 * @param {string} dstFile path dove piazzare il file su server remoto
 */
async function uploadShfile(session, srcFile, dstFile) {
    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    await session.uploadFile(srcFile, dstFile);
    // passo dos2unix per evitare problemi coding windows
    await session.command('dos2unix ' + dstFile);
    // eseguo setup.sh sul server
    await session.command('sudo chmod +x ' + dstFile);
}
exports.uploadShfile = uploadShfile;
/**
 * Carica e esegue uno script sh su server remoto. Lo script viene eseguito con sudo.
 *
 * @param session sessione ssh
 * @param srcFile path file da caricare su disco locale
 * @param dstFile path dove piazzare if file su server remoto. Deve essere path assoluto, il nome non è fondamentale, basta che sia valido su sistema remoto.
 * @param params parametri di esecuzione script su server remoto
 */
async function uploadAndRunShFile(session, srcFile, dstFile, params = []) {
    await uploadShfile(session, srcFile, dstFile);
    const _p = params.length === 0 ? '' : (' ' + params.join(' '));
    return await session.command('sudo ' + dstFile + _p);
}
exports.uploadAndRunShFile = uploadAndRunShFile;
//# sourceMappingURL=uploadShFile.js.map