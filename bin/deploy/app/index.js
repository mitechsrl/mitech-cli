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
const targets = require('../../../lib/targets');
const { deploy } = require('./_lib/deploy');

module.exports.info = [
    'Utility deploy App su VM'
];
module.exports.help = [
    'Esegue un deploy su una VM con ambiente nodejs: carica il progetto locale, esegue npm install e pm2 restart.',
    'I files caricati possono essere controllati tramite il file .mitechcliignore, avente sintassi identica a .gitIgnore.',
    'Per default, vengono escluse le directory node_modules e .git',
    '',
    ['-d', 'Esegui il download del backup dell\'app remota'],
    ['-y', 'Risposta automatica <yes> su conferma deploy']
];

module.exports.cmd = async function (basepath, params) {
    const target = await targets.get();
    targets.print(target);
    if (!target) return;

    const result = await deploy(target, params);

    if (result.aborted) {
        logger.error('Deploy abortito');
    }
    if (result.aborted) {
        logger.info('Deploy Completato');
    }
};
