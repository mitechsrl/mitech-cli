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
const targets = require('../../../../lib/targets');
const inquirer = require('inquirer');
const path = require('path');
const logger = require('../../../../lib/logger');
const { runTargetConfiguration } = require('../../../../lib/runTargetConfiguration');

module.exports.info = 'Utility setup environment nodejs su VM';
module.exports.help = [];
module.exports.cmd = async function (basepath, params) {
    const target = await targets.get();
    targets.print(target);

    if (!target) return;

    const answers = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Hai verificato la compatibilità del setup con <mitech vm pre-setup>?'
    }]);
    if (answers.confirm !== true) {
        logger.error('Verifica prima la compatibilità.');
        return;
    }

    logger.log('');
    logger.info("Questo script installerà l'ambiente nodejs sul server target selezionato");
    logger.log('');

    await runTargetConfiguration(target, path.join(__dirname, './_configs'));
};
