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
const path = require('path');
const logger = require('../../../../lib/logger');
const directoryConfigsScanner = require('../../../../lib/directoryConfigsScanner');

module.exports.info = 'Utility setup mongodb su VM';
module.exports.help = [];

module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);

    if (!target) {
        logger.error('Nessun target selezionato');
        return;
    }

    logger.log('');
    logger.info('Questo script installerà mongodb sul server target selezionato');
    logger.log('');

    const configs = await directoryConfigsScanner(path.join(__dirname, '_configs'));

    const questions = [{
        type: 'list',
        name: 'mode',
        message: 'Modalità di setup',
        choices: configs
    }];

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
            const script = require(path.join(mode.dir, 'index.js'));
            return script(session, answers);
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => {
            if (session) session.disconnect();
        });
};
