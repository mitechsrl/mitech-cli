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
const runLinux = require('./lib/runLinux');
const logger = require('../../../../lib/logger');

module.exports.info = 'Utility setup environment nodejs su VM';
module.exports.help = [];
module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);

    if (!target) return;

    const beforeStart = [
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Hai verificato la compatibilità del setup con <mitech vm pre-setup>?'
        }
    ];
    const answers = await inquirer.prompt(beforeStart);
    if (answers.confirm !== true) {
        logger.error('Verifica prima la compatibilità.');
        return;
    }
    logger.log('');
    logger.info("Questo script installerà l'ambiente nodejs sul server target selezionato");
    logger.log('');
    const questions = [
        {
            type: 'input',
            name: 'MITECH_HOSTNAME',
            message: 'FQDN hostname (no http(s)://)'
        }
    ];

    inquirer.prompt(questions)
        .then(answers => {
            let session = null;
            ssh.createSshSession(target)
                .then(_session => {
                    session = _session;
                    if (session.os.linux) {
                        return runLinux(session, answers);
                    }
                    return Promise.reject(new Error('Setup script non disponibile per la piattaforma ' + JSON.stringify(session.os)));
                })
                .catch(error => {
                    logger.error(error);
                })
                .then(() => {
                    if (session) session.disconnect();
                });
        });
};
