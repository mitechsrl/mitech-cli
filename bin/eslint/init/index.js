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
const { spawn } = require('child_process');
const npmUtils = require('../../npm/utils');
const fs = require('fs');
const path = require('path');

module.exports.info = 'Installa dipendenze eslint nel sistema';
module.exports.help = [
];

module.exports.cmd = async function (basepath, params, logger) {
    const npmParams = [
        'install',
        '--save-dev',
        'eslint',
        'babel-eslint',
        'eslint-config-standard',
        'eslint-plugin-import',
        'eslint-plugin-node',
        'eslint-plugin-promise',
        'eslint-plugin-react',
        'eslint-plugin-standard'
    ];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    const npm = spawn(npmUtils.npmExecutable, npmParams, { stdio: 'inherit' });

    npm.on('error', (data) => {
        console.log(`error: ${data}`);
    });

    npm.on('exit', (code) => {
        if (code === 0) {
            logger.info('Installazione dipendenze completata.');

            const eslintRc = fs.readFileSync(path.join(__dirname, '.eslintrc.json'));
            fs.writeFileSync('.eslintrc.json', eslintRc);

            logger.info('file .eslintrc.json creato');
            logger.info("Installa l'estensione Eslint (dbaeumer.vscode-eslint) per vscode");
        } else {
            logger.log('');
            logger.error('installazione fallita: exit code = ' + code);
        }
    });
};
