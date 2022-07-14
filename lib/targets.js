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

const logger = require('./logger');
const inquirer = require('inquirer');
const crypto = require('./crypto');
const emoji = require('node-emoji');
const { getMitechCliFile } = require('./mitechCliFile');
const _ = require('lodash');
/**
 * get the targets list from the first of the localFiles found
 */
const list = function () {
    const mitechCliFile = getMitechCliFile();

    if (!mitechCliFile) return null;
    if (!mitechCliFile.content.targets) return null;
    return { file: mitechCliFile.file, targets: mitechCliFile.content.targets };
};

module.exports.list = list;

/**
 * DEcode the target password if needed
 * @param {*} target
 */
const decodeTarget = (target) => {
    const _t = _.cloneDeep(target);
    // La password va decodificata prima di poterla usare
    if (_t.accessType === 'password') {
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        _t.password = crypto.decrypt(_t.password.iv, encryptionKey, _t.password.encryptedData);
    }
    return _t;
};
module.exports.decodeTarget = decodeTarget;

/**
 * Ottiene la lista dei target disponibili in base alla directory di scansione.
 * NOTA: la funzione autoseleziona l'unico target disponibile senza chiedere conferma

 * @returns
 */
const get = async function (targetId) {
    const targetsList = list();
    if (!targetsList) throw new Error('Nessun file .mitechcli trovato');

    logger.info('Uso file: ' + targetsList.file);
    if (!targetsList || targetsList.targets.length === 0) return null;

    let _t = null;
    if (targetsList.targets.length === 1) {
        _t = targetsList.targets[0];
    } else {
        const questions = [{
            type: 'list',
            name: 'target',
            message: 'Seleziona target: ',
            choices: targetsList.targets.map(item => ({ name: item.name, value: item }))
        }];
        const answers = await inquirer.prompt(questions);
        _t = answers.target;
    }

    return decodeTarget(_t);
};

module.exports.get = get;

/**
 * Stampa il target selezionato
 * @param {*} target
 */
const print = (target) => {
    if (!target) {
        logger.warn('Nessun target correntemente attivo');
        logger.log('Usa <mitech ssh target add> per crearne uno, oppure <mitech ssh target set> per usarne uno già creato');
    } else {
        const separator = '─';
        const targetStrings = [
            emoji.emojify(' :arrow_forward:   Nome target: ' + target.name),
            emoji.emojify(' :globe_with_meridians:  Hostname/ip: ' + target.host)
        ];
        const selectedTarget = 'Target selezionato';
        const l = Math.max(targetStrings[0].length, targetStrings[1].length);
        const l2 = Math.ceil((l - selectedTarget.length) / 2);
        const halfSep = separator.repeat(l2 - 1);

        logger.warn('');
        logger.warn('┌' + halfSep + ' ' + selectedTarget + ' ' + halfSep + '┐');
        logger.warn(targetStrings.join('\n'));
        logger.warn('└' + separator.repeat(2 * l2 + selectedTarget.length) + '┘');
    }
    logger.log('');
};

module.exports.print = print;
