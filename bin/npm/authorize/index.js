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

const fs = require('fs');
const npmUtils = require('../utils');

const scope = '@mitech';

module.exports.info = "Crea nella directory corrente un file .npmrc che permette l'accesso al registry NPM Mitech in fase di install";
module.exports.help = [];
module.exports.cmd = async function (basepath, params, logger) {
    logger.debug('Directory corrente: ' + process.cwd());

    /* step 2 ************************************************************************/
    logger.log('Preparo .npmrc...');

    logger.log("uso account  'readonlyAccount'");

    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await npmUtils.getRegistry(scope);
    fs.writeFileSync('.npmrc', npmUtils.buildNpmrc(registry, 'readonlyAccount'));

    logger.log('File .npmrc creato!');
};
