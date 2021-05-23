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
const ssh = require('../../../../lib/ssh');
const _target = require('../../../../lib/target');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

module.exports.info = 'Utility setup mongodb su VM';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    const target = await _target.get();
    _target.print(target);

    if (!target) {
        logger.error('Nessun target selezionato');
        return;
    }

    logger.log('');
    logger.info('Questo script installerà mongodb sul server target selezionato');
    logger.log('');
    var questions = [
        {
            type: 'list',
            name: 'mode',
            message: 'Modalità di setup',
            choices: [
                {
                    name: 'Ubuntu 20.04, MongoDb 4.2.X, ssl/tls self signed, auth admin, auth user)',
                    value: {
                        questions: [
                            {
                                type: 'password',
                                name: 'adminPassword',
                                message: 'Password utente admin'
                            },
                            {
                                type: 'password',
                                name: 'adminPasswordConfirm',
                                message: 'Conferma password utente admin'
                            },
                            {
                                type: 'input',
                                name: 'userUsername',
                                message: 'Username utente per app'
                            },
                            {
                                type: 'password',
                                name: 'userPassword',
                                message: 'Password utente app'
                            },
                            {
                                type: 'password',
                                name: 'userPasswordConfirm',
                                message: 'Conferma password utente app'
                            }
                        ],
                        dir: 'ubu2004_mongo4.2.X_SSL_admin_user'
                    }
                }]
        }
    ];

    let mode = null;
    let session = null;
    let answers = null;
    inquirer.prompt(questions)
        .then(answers => {
            mode = answers.mode;
            if (mode.questions) {
                return inquirer.prompt(mode.questions);
            }
            return {};
        })
        .then(_answers => {
            if (_answers.adminPassword !== _answers.adminPasswordConfirm) throw (new Error('Password utente e conferma non corrispondono'));
            if (_answers.userPassword !== _answers.userPasswordConfirm) throw (new Error('Password admin e conferma non corrispondono'));

            answers = _answers;
            return ssh.createSshSession(target);
        })
        .then(_session => {
            session = _session;
            const script = require(path.join(__dirname, mode.dir, 'index.js'));
            return script(session, logger, answers);
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => {
            if (session) session.disconnect();
        });
};
