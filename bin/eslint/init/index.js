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

const npmUtils = require('../../npm/utils');
const fs = require('fs');
const path = require('path');
const spawn = require('../../../lib/spawn');
const logger = require('../../../lib/logger');

module.exports.info = 'Installa dipendenze eslint nel sistema';
module.exports.help = [
];

module.exports.cmd = async function (basepath, params) {
    let npmParams = [
        'install',
        '-D',
        'eslint',
        '@babel/core@latest',
        '@babel/eslint-parser@latest',
        'eslint-config-standard@latest',
        'eslint-plugin-import@latest',
        'eslint-plugin-node@latest',
        'eslint-plugin-promise@latest',
        'eslint-plugin-react@latest',
        '@babel/preset-react@latest',
        '@babel/preset-env@latest'
    ];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    await spawn(npmUtils.npmExecutable, npmParams);

    npmParams = [
        'uninstall',
        'babel-eslint',
        'eslint-plugin-standard'
    ];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    await spawn(npmUtils.npmExecutable, npmParams, { stdio: 'inherit' });

    logger.info('Installazione dipendenze completata.');

    const eslintRc = fs.readFileSync(path.join(__dirname, '.eslintrcsource.js'));
    fs.writeFileSync('.eslintrc.js', eslintRc);

    logger.info('file .eslintrc.js creato');
    logger.info("Installa l'estensione Eslint (dbaeumer.vscode-eslint) per vscode");
};
