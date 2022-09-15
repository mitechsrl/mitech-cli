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
const spawn = require('../../../lib/spawn');

module.exports.info = 'Verifica up-to-date build. Stampa la lista di commits eseguite dall\'ultimo tag di versione';
module.exports.help = [
    'Verifica se sono state eseguite commit dall\'ultimo tag di versione. Se ve ne sono, allora sono state apportate modifiche dopo l\'ultima build'
];

module.exports.cmd = async function (basepath, params) {
    logger.log('Autofetch...');

    // faccio fetch per avere info sulle commit in master
    await spawn('git', ['fetch'], false);
    const status = await spawn('git', ['status'], false);
    if (status.data.indexOf('is behind') >= 0) {
        logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }

    const lastTag = await spawn('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode !== 0) || (!lastTag.data)) {
        logger.error(':collision: Impossibile trovare un tag ');
        return;
    }

    const _count = await spawn('git', ['rev-list', '--count', lastTag.data.trim() + '..HEAD'], false);
    const count = parseInt(_count.data.trim());

    logger.info('\nUltimo tag trovato: ' + lastTag.data.trim() + '\n');
    if (count === 0) {
        logger.log('Non ci sono commit dal tag ' + lastTag.data.trim());
    } else {
        logger.warn('Sono state trovate ' + count + ' commit dal tag ' + lastTag.data.trim() + '\n');
        const commitsFromTag = await spawn('git', ['log', lastTag.data.trim() + '..HEAD', '--pretty=format:"%h - %an - %s - %ad"'], false);
        logger.log(commitsFromTag.data);
    }
};
