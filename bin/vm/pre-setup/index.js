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
const logger = require('../../../lib/logger');
const ssh = require('../../../lib/ssh');
const targets = require('../../../lib/targets');
const linuxCmds = require('./linux');

module.exports.info = 'Vm pre-setup checks utility';
module.exports.help = [];

module.exports.cmd = async function (basepath, params) {
    const target = await targets.get();
    targets.print(target);

    if (!target) return;

    logger.log('');
    logger.info('Questo script eseguirà alcune verifiche al sistema remoto senza apportare alcuna modifica');
    logger.log('');

    let session = null;
    ssh.createSshSession(target)
        .then(_session => {
            session = _session;
            if (session.os.linux) {
                return linuxCmds(session);
            }
            return Promise.reject(new Error('Pre-setup script non disponibile per la piattaforma ' + JSON.stringify(session.os)));
        })
        .then(() => {
            logger.log('');
            logger.info('Tutti i test passati. Puoi procedere con il setup');
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => {
            if (session) session.disconnect();
        });
};
