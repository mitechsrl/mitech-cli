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

const target = require('../../../lib/target');
const ssh = require('../../../lib/ssh');

module.exports.info = 'Utility setup ssl VM';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    const t = await target.get();
    target.print(t);

    console.log('');

    const session = await ssh.createSshSession(t);
    logger.debug('lancio reboot...');
    await session.command('sudo reboot -h now');
    session.disconnect();
};

