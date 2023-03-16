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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printDatabase = exports.getDatabase = exports.SUPPORTED_TYPES = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../types");
const crypto_1 = require("./crypto");
const environment_1 = require("./environment");
const logger_1 = require("./logger");
const mitechCliFile_1 = require("./mitechCliFile");
exports.SUPPORTED_TYPES = ['mongodb'];
/**
 * Verifica la configurazione del db
 * @param db
 */
function checkDatabase(db) {
    var _a;
    if (!exports.SUPPORTED_TYPES.includes((_a = db.type) !== null && _a !== void 0 ? _a : '')) {
        throw new types_1.StringError('Il database selezionato è di tipo non supportato. Usa uno di questi: ' + exports.SUPPORTED_TYPES.join(', '));
    }
    if (!db.name) {
        throw new types_1.StringError('Il database selezionato non ha <name> definito');
    }
    if (!db.host) {
        throw new types_1.StringError('Il database selezionato non ha <host> definito');
    }
    if (!db.port) {
        db.port = '27017';
    }
    else if (typeof db.port === 'number') {
        db.port = db.port.toString();
    }
    if (db.port && !db.port.match(/^[0-9]+$/)) {
        throw new types_1.StringError('Il database selezionato ha <port> invalida');
    }
    if ([db.username, db.password].filter(v => !!v).length === 1) {
        throw new types_1.StringError('Il database selezionato ha credenziali incomplete. Verifica username e password.');
    }
}
/**
 * Seleziona un database dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico database disponibile se la lista è composta da un solo database
 * @returns
 */
async function getDatabase() {
    var _a;
    const mitechCliFile = (0, mitechCliFile_1.getMitechCliFile)();
    logger_1.logger.info('Uso file: ' + mitechCliFile.file);
    const databases = (_a = mitechCliFile.content.dbs) !== null && _a !== void 0 ? _a : [];
    if (databases.length === 0) {
        throw new types_1.StringError('Nessun database disponibile. Aggiungi al tuo file .mitechcli la sezione <dbs>.');
    }
    let _t;
    if (databases.length === 1) {
        _t = databases[0];
    }
    else {
        const questions = [{
                type: 'list',
                name: 'database',
                message: 'Seleziona database',
                choices: databases.map(item => ({ name: item.name, value: item }))
            }];
        const answers = await inquirer_1.default.prompt(questions);
        _t = answers.database;
    }
    if (!_t) {
        throw new types_1.StringError('Nessun database selezionato');
    }
    checkDatabase(_t);
    // decrypt encrypted object
    if (_t.password && typeof _t.password === 'object') {
        _t.password = (0, crypto_1.decrypt)(_t.password.iv, environment_1.environment.encryptionKey, _t.password.encryptedData);
    }
    return _t;
}
exports.getDatabase = getDatabase;
/**
 * Stampa il database selezionato
 *
 * @param {*} database
 */
function printDatabase(database) {
    var _a;
    if (!database) {
        logger_1.logger.warn('Nessun database selezionato');
    }
    else {
        const separator = '─';
        const strings = [
            ' :arrow_forward:   Nome: ' + database.name,
            ' :globe_with_meridians:  Hostname/ip: ' + database.host + ':' + ((_a = database.port) !== null && _a !== void 0 ? _a : '27017')
        ];
        const selectedDatabase = 'Database selezionato';
        const l = Math.max(strings[0].length, strings[1].length);
        const l2 = Math.ceil((l - selectedDatabase.length) / 2);
        const halfSep = separator.repeat(l2 - 1);
        logger_1.logger.warn('');
        logger_1.logger.warn('┌' + halfSep + ' ' + selectedDatabase + ' ' + halfSep + '┐');
        logger_1.logger.warn(strings.join('\n'));
        logger_1.logger.warn('└' + separator.repeat(2 * l2 + selectedDatabase.length) + '┘');
    }
    logger_1.logger.log('');
}
exports.printDatabase = printDatabase;
//# sourceMappingURL=databaseSelector.js.map