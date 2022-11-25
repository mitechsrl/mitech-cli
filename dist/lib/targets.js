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
exports.printTarget = exports.getTarget = exports.decodeTarget = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const lodash_1 = __importDefault(require("lodash"));
const types_1 = require("../types");
const crypto_1 = require("./crypto");
const logger_1 = require("./logger");
const mitechCliFile_1 = require("./mitechCliFile");
/**
 * DEcode the target password if needed
 * @param {*} target
 */
function decodeTarget(target) {
    const _t = lodash_1.default.cloneDeep(target);
    // La password va decodificata prima di poterla usare
    if (_t.accessType === 'password') {
        if (typeof _t.password !== 'object') {
            throw new Error('Cannot decrypt password.');
        }
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        _t.password = (0, crypto_1.decrypt)(_t.password.iv, encryptionKey, _t.password.encryptedData);
    }
    return _t;
}
exports.decodeTarget = decodeTarget;
/**
 * Seleziona un target dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico target disponibile se la lista è composta da un solo target
 * @returns
 */
async function getTarget(argv) {
    const mitechCliFile = (0, mitechCliFile_1.getMitechCliFile)();
    logger_1.logger.info('Uso file: ' + mitechCliFile.file);
    if (mitechCliFile.content.targets.length === 0) {
        throw new types_1.StringError('Nessun target disponibile');
    }
    const targets = mitechCliFile.content.targets;
    let _t;
    if (argv === null || argv === void 0 ? void 0 : argv.target) {
        // autoselect con match nome da parametri
        _t = targets.find(target => target.name === argv.target);
        if (!_t)
            throw new types_1.StringError('Target ' + argv.target + ' non trovato');
    }
    else if (targets.length === 1) {
        // autoselect unico target disponibile
        _t = targets[0];
    }
    else {
        // chiedere al bomber davanti al monitor
        const questions = [{
                type: 'list',
                name: 'target',
                message: 'Seleziona target: ',
                choices: targets.map(item => ({ name: item.name, value: item }))
            }];
        const answers = await inquirer_1.default.prompt(questions);
        _t = answers.target;
    }
    if (!_t) {
        throw new types_1.StringError('Nessun target selezionato');
    }
    return decodeTarget(_t);
}
exports.getTarget = getTarget;
/**
 * Stampa il target selezionato
 *
 * @param {*} target
 */
function printTarget(target) {
    if (!target) {
        logger_1.logger.warn('Nessun target correntemente attivo');
        logger_1.logger.log('Usa <mitech ssh target add> per crearne uno, oppure <mitech ssh target set> per usarne uno già creato');
    }
    else {
        const separator = '─';
        const targetStrings = [
            ' :arrow_forward:   Nome target: ' + target.name,
            ' :globe_with_meridians:  Hostname/ip: ' + target.host
        ];
        const selectedTarget = 'Target selezionato';
        const l = Math.max(targetStrings[0].length, targetStrings[1].length);
        const l2 = Math.ceil((l - selectedTarget.length) / 2);
        const halfSep = separator.repeat(l2 - 1);
        logger_1.logger.warn('');
        logger_1.logger.warn('┌' + halfSep + ' ' + selectedTarget + ' ' + halfSep + '┐');
        logger_1.logger.warn(targetStrings.join('\n'));
        logger_1.logger.warn('└' + separator.repeat(2 * l2 + selectedTarget.length) + '┘');
    }
    logger_1.logger.log('');
}
exports.printTarget = printTarget;
//# sourceMappingURL=targets.js.map