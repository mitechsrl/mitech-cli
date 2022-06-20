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

const _target = require('../../lib/target');
const ssh = require('../../lib/ssh');
const logger = require('../../lib/logger');

module.exports.info = 'Utility gestione crowdsec (cscli). Vedi https://docs.crowdsec.net/docs/cscli/cscli/ per info';
module.exports.help = [
    "Proxy esecuzione comandi cscli su server remoto. \"Mitech cscli <any command>\" esegue \"cscli <any command>\" su server remoto",
    "Vedi https://docs.crowdsec.net/docs/cscli/cscli/ per info.",
    "",
    ['<cscli param>', 'Un qualsiasi comando cscli da eseguire sul server remoto']
];
module.exports.catchUnimplementedParams = true;
module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);

    if (params.length === 0) {
        logger.warn('Nessun comando eseguito. Digita <mitech cscli -h>  per info');
        return;
    }

    let session = null;

    ssh.createSshSession(target)
        .then(async _session => {
            session = _session;
            if (session.os.linux) {
                return session.command(['sudo', 'cscli', ...params]);
            }
            throw new Error('cscli non implementata per os su vm');
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => {
            session.disconnect();
        });
};
