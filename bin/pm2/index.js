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

const targets = require('../../lib/targets');
const ssh = require('../../lib/ssh');
const logger = require('../../lib/logger');

module.exports.info = 'Utility gestione pm2';
module.exports.help = [['<pm2 param>', 'Un qualsiasi comando di pm2 da eseguire sul server remoto']];
module.exports.catchUnimplementedParams = true;
module.exports.cmd = async function (basepath, params) {
    const target = await targets.get();
    targets.print(target);

    if (params.length === 0) {
        logger.warn('Nessun comando eseguito. Digita <mitech pm2 -h>  per info');
        return;
    }

    let session = null;
    try {
        session = await ssh.createSshSession(target);
        const nodeUser = target.nodeUser || 'node';
        const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';
        await session.commandAs(nodeUser, [pm2, ...params]);
    } catch (error) {
        logger.error(error);
    }
    session.disconnect();
};
