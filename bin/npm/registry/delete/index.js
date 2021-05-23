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

const npmUtils = require('../../utils');
const persistent = require('../../../../lib/persistent');

module.exports.info = 'Utility rimozione registry NPM';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    logger.log('Seleziona il registry da eliminare');
    const registry = await npmUtils.getRegistry(null, null, false);
    if (!registry) return;

    let npmInfo = persistent.get('npm');
    npmInfo = npmInfo.filter(r => r.id !== registry.id);
    persistent.set('npm', npmInfo);
    logger.log('Registry rimosso!');
};
