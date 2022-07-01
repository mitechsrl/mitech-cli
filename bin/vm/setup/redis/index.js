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
const runLinuxConfiguration = require('../../../../lib/runLinuxConfiguration');
const logger = require('../../../../lib/logger');
const path = require('path');
const { runTargetConfiguration } = require('../../../../lib/runTargetConfiguration');

module.exports.info = 'Utility setup redis su VM';
module.exports.help = [];
module.exports.cmd = async function (basepath, params) {
    const target = await _target.get();
    _target.print(target);

    if (!target) return;

    logger.log('');
    logger.info('Questo script installerà redis sul server target selezionato');
    logger.log('');

    await runTargetConfiguration(target, path.join(__dirname, './_configs'));
};