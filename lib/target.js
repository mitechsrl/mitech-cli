const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const inquirer = require('inquirer');
const crypto = require('./crypto');
const emoji = require('node-emoji');
// check from local file
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
    // must decode password before using
    if (_t.accessType === 'password') {
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        _t.password = crypto.decrypt(_t.password.iv, encryptionKey, _t.password.encryptedData);
    }
    return _t;
};

module.exports.get = get;

const print = (target) => {
    if (!target) {
        logger.warn('Nessun target correntemente attivo');
        logger.log('Usa <mitech ssh target add> per crearne uno, oppure <mitech ssh target set> per usarne uno già creato');
    } else {
        const targetStrings = [
            emoji.emojify(':arrow_forward:  Nome target: ' + target.name),
            emoji.emojify(':globe_with_meridians: Hostname/ip: ' + target.host)
        ];
        const selectedTarget = 'Target selezionato';
        const l = Math.max(targetStrings[0].length, targetStrings[1].length);
        const l2 = Math.ceil((l - selectedTarget.length) / 2);
        logger.warn('');
        logger.warn(Array(l2 - 1).fill('*').join('') + ' ' + selectedTarget + ' ' + Array(l2 - 1).fill('*').join(''));
        logger.warn(targetStrings.join('\n'));
        logger.warn(Array(2 * l2 + selectedTarget.length).fill('*').join(''));
    }
    logger.log('');
};

module.exports.print = print;
