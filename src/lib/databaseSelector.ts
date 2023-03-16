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

import inquirer from 'inquirer';
import _ from 'lodash';
import { MitechCliFileContentDb, StringError } from '../types';
import { decrypt } from './crypto';
import { environment } from './environment';
import { logger } from './logger';
import { getMitechCliFile } from './mitechCliFile';

export const SUPPORTED_TYPES = ['mongodb'];
/**
 * Verifica la configurazione del db
 * @param db 
 */
function checkDatabase(db: MitechCliFileContentDb){
    
    if (!SUPPORTED_TYPES.includes(db.type??'')){
        throw new StringError('Il database selezionato è di tipo non supportato. Usa uno di questi: '+SUPPORTED_TYPES.join(', '));
    }

    if (!db.name){
        throw new StringError('Il database selezionato non ha <name> definito');
    }
    if (!db.host){
        throw new StringError('Il database selezionato non ha <host> definito');
    }

    if(!db.port){
        db.port = '27017';
    }else if (typeof db.port === 'number'){
        db.port = (db.port as number).toString();
    }
    if (db.port && !db.port.match(/^[0-9]+$/)){
        throw new StringError('Il database selezionato ha <port> invalida');
    }

    if ([db.username, db.password].filter(v => !!v).length === 1 ){
        throw new StringError('Il database selezionato ha credenziali incomplete. Verifica username e password.');
    }
}

/**
 * Seleziona un database dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico database disponibile se la lista è composta da un solo database
 * @returns
 */
export async function getDatabase(): Promise<MitechCliFileContentDb> {

    const mitechCliFile = getMitechCliFile();

    logger.info('Uso file: ' + mitechCliFile.file);
    const databases = mitechCliFile.content.dbs ?? [];

    if (databases.length === 0) {
        throw new StringError('Nessun database disponibile. Aggiungi al tuo file .mitechcli la sezione <dbs>.');
    }

    let _t: MitechCliFileContentDb;
    if (databases.length === 1 ) {
        _t = databases[0];
    } else {
        const questions = [{
            type: 'list',
            name: 'database',
            message: 'Seleziona database',
            choices: databases.map(item => ({ name: item.name, value: item }))
        }];
        const answers = await inquirer.prompt(questions);
        _t = answers.database;
    }

    if (!_t) {
        throw new StringError('Nessun database selezionato');
    }
    
    checkDatabase(_t);

    // decrypt encrypted object
    if (_t.password && typeof _t.password === 'object') {
        _t.password = decrypt(_t.password.iv, environment.encryptionKey, _t.password.encryptedData);
    }

    return _t as MitechCliFileContentDb;
}

/**
 * Stampa il database selezionato
 * 
 * @param {*} database
 */
export function printDatabase(database: MitechCliFileContentDb) {
    if (!database) {
        logger.warn('Nessun database selezionato');
    } else {
        const separator = '─';
        const strings = [
            ' :arrow_forward:   Nome: ' + database.name,
            ' :globe_with_meridians:  Hostname/ip: ' + database.host+':'+(database.port ?? '27017')
        ];

        const selectedDatabase = 'Database selezionato';
        const l = Math.max(strings[0].length, strings[1].length);
        const l2 = Math.ceil((l - selectedDatabase.length) / 2);
        const halfSep = separator.repeat(l2 - 1);

        logger.warn('');
        logger.warn('┌' + halfSep + ' ' + selectedDatabase + ' ' + halfSep + '┐');
        logger.warn(strings.join('\n'));
        logger.warn('└' + separator.repeat(2 * l2 + selectedDatabase.length) + '┘');
    }
    logger.log('');
}

