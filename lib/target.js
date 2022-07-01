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

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const inquirer = require('inquirer');
const crypto = require('./crypto');
const emoji = require('node-emoji');

/**
 * Lista di files da scansionare alla ricerca di targets
 */
const localFiles = [
    path.join(process.cwd(), '.mitechcli'),
    path.join(process.cwd(), '.mitechcli.json'),
    path.join(process.cwd(), '../.mitechcli'),
    path.join(process.cwd(), '../.mitechcli.json'),
    path.join(process.cwd(), '../../.mitechcli'),
    path.join(process.cwd(), '../../.mitechcli.json')
];

/**
 * get the targets list from the first of the localFiles found
 */
const list = function () {
    return localFiles.reduce((found, localFile) => {
        if (found !== null) return found;

        if (fs.existsSync(localFile)) {
            let file = fs.readFileSync(localFile).toString();
            try {
                file = JSON.parse(file);
                if (file.targets) return { file: localFile, targets: file.targets };
                return null;
            } catch (e) {
                logger.error(e);
                return null;
            }
        }
        return null;
    }, null);
};

module.exports.list = list;

/**
 * Ottiene la lista dei target disponibili in base alla directory di scansione
 * @returns
 */
const get = async function () {
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

    // La password va decodificata prima di poterla usare
    if (_t.accessType === 'password') {
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        _t.password = crypto.decrypt(_t.password.iv, encryptionKey, _t.password.encryptedData);
    }
    return _t;
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
