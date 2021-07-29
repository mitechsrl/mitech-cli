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
const fs = require('fs').promises;
const path = require('path');

module.exports.info = 'Utility manipolazione dipendenze npm in package.json';
module.exports.help = [
    'Aggiunge o rimpiazza una dipendenza nel package.json specificato',
    ['-p', 'Path al file package.json da eleborare'],
    ['-d', 'Nome pacchetto npm da aggiungere/sostituire'],
    ['-dv', 'Versione del pacchetto da aggiungere/sostituire']
];

module.exports.cmd = async function (basepath, params) {
    const packageJsonToBeUpdate = params.get('-p');
    const dependency = params.get('-d');
    const dependencyVersion = params.get('-dv');

    if (!packageJsonToBeUpdate.found) return logger.error('Parametro <-p> non specificato. Vedi <-h> per help');
    if (!dependency.found) return logger.error('Parametro <-d> non specificato. Vedi <-h> per help');
    if (!dependencyVersion.found) return logger.error('Parametro <-dv> non specificato. Vedi <-h> per help');

    const file = path.resolve(process.cwd(), packageJsonToBeUpdate.value);
    const fileContent = await fs.readFile(file);
    const json = JSON.parse(fileContent.toString());
    json.dependencies = json.dependencies || {};
    json.dependencies[dependency.value] = dependencyVersion.value;

    await fs.writeFile(file, JSON.stringify(json, null, 4));

    logger.info('Update completato');
};
