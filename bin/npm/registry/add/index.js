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

const persistent = require('../../../../lib/persistent');
const inquirer = require('inquirer');
const logger = require('../../../../lib/logger');

module.exports.info = 'Gestione configurazione registry npm';
module.exports.help = [];
module.exports.cmd = async function (basepath, params) {
    let npmInfo = persistent.get('npm');
    if (!Array.isArray(npmInfo) && Object.keys(npmInfo).length === 0) {
        npmInfo = [];
    }

    const questions = [
        {
            type: 'input',
            name: 'id',
            message: 'id (caratteri accettati a-z, A-Z, 0-9, -)'
        },
        {
            type: 'input',
            name: 'scope (@somename)',
            message: 'scope'
        },
        {
            type: 'input',
            name: 'registry',
            message: 'Url registry (con https://)'
        },
        {
            type: 'input',
            name: 'manage_username',
            message: 'Username utente management'
        },
        {
            type: 'password',
            name: 'manage_password',
            message: 'Password utente management'
        },
        {
            type: 'input',
            name: 'readonly_username',
            message: 'Username utente readonly'
        },
        {
            type: 'password',
            name: 'readonly_password',
            message: 'Password utente readonly'
        }
    ];

    inquirer.prompt(questions).then(answers => {
        const registry = {
            id: answers.id.replace(/[^a-zA-Z0-9-]/g, ''),
            registry: answers.registry,
            scope: answers.scope,
            managementAccount: {
                username: answers.manage_username,
                password: answers.manage_password
            },
            readonlyAccount: {
                username: answers.readonly_username,
                password: answers.readonly_password
            }
        };

        npmInfo.push(registry);
        npmInfo.sort((a, b) => (a === b) ? 0 : (a < b) ? -1 : 1);
        persistent.set('npm', npmInfo);
        logger.info('Registry aggiunto');
    });
};
