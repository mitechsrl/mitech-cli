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

const inquirer = require('inquirer');
const uuid = require('uuid');
const fs = require('fs');
const crypto = require('../../../../lib/crypto');
const logger = require('../../../../lib/logger');

module.exports.info = 'Aggiunge target remoto per ssh';
module.exports.help = [];

module.exports.cmd = async function (basepath, params) {
    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Descrizione'
        },
        {
            type: 'input',
            name: 'host',
            message: 'Host remoto (ip oppure hostname)'
        },
        {
            type: 'number',
            name: 'port',
            message: 'Porta ssh (default 22)'
        },
        {
            type: 'input',
            name: 'username',
            message: 'Username ssh'
        },
        {
            type: 'list',
            name: 'accessType',
            message: 'Quale tipologia di autenticazione si vuole usare?',
            choices: [{ name: 'password', value: 'password' }, { name: 'chiave ssh', value: 'sshKey' }]
        },
        {
            type: 'password',
            message: 'Password ssh',
            name: 'password',
            when: (answers) => answers.accessType === 'password'
        },
        {
            type: 'input',
            message: 'Chiave ssh (path assoluto)',
            name: 'sshKey',
            when: (answers) => answers.accessType === 'sshKey'
        },
        {
            type: 'input',
            name: 'nodeUser',
            message: 'Utente dedicato ai processi node (default "onit")'
        }
    ];

    inquirer.prompt(questions).then(answers => {
        answers.id = uuid.v4();
        answers.port = answers.port || 22;
        answers.nodeUser = answers.nodeUser || 'onit';

        let _t = {};
        let fileName = '.mitechcli';
        if (fs.existsSync(fileName)) {
            _t = JSON.parse(fs.readFileSync(fileName));
        } else {
            fileName = fileName + '.json';
            if (fs.existsSync(fileName)) {
                _t = JSON.parse(fs.readFileSync(fileName));
            }
        }

        if (answers.accessType === 'password') {
            const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
            answers.password = crypto.encrypt(encryptionKey, answers.password);
        }
        _t.targets = _t.targets || [];
        _t.targets.push(answers);
        fs.writeFileSync(fileName, JSON.stringify(_t, null, 4));
        logger.log('Target creato');
    });
};

