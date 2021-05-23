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
const inquirer = require('inquirer');
const npmUtils = require('../utils');
const fs = require('fs');

const scope = '@mitech';

module.exports.info = 'Rimuove un pacchetto dal registry NPM Mitech';
module.exports.help = [
    ['-p', 'Nome del pacchetto da rimuovere']
];
module.exports.cmd = async function (basepath, params, logger) {
    const packageNameIndex = params.findIndex(p => p == '-p');
    if (packageNameIndex < 0) {
        return logger.error('Specifica il pacchetto da rimuovere con "-p packageName"');
    }

    const packageName = params[packageNameIndex + 1];
    if (!packageName) {
        return logger.error('Nome pacchetto non valido');
    }

    try {
        const response = await inquirer.prompt({
            type: 'confirm',
            name: 'value',
            message: 'Il pacchetto ' + packageName + ' verrà rimosso dal registry NPM Mitech. Sei sicuro? '
        });
        if (!response.value) return;
    } catch (e) {
        return;
    }

    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await npmUtils.getRegistry(scope);
    fs.writeFileSync('.npmrc', npmUtils.buildNpmrc(registry));

    const registryUrl = registry.registry;

    /* eseguo comando ************************************************************************/
    const npmParams = ['unpublish', packageName, '--registry', registryUrl, '--access', 'restricted', '--force'];
    logger.log('Eseguo npm ' + npmParams.join(' '));

    const npm = spawn(npmUtils.npmExecutable, npmParams, { stdio: 'inherit' });

    npm.on('error', (data) => {
        console.log(`error: ${data}`);
    });

    npm.on('exit', (code) => {
        try {
            // rimuovo il file .npmrc. Non serve oltre l'operazione npm
            //fs.unlinkSync('.npmrc');
        } catch (e) { }

        if (code === 0) {
            logger.info('Unpublish completo!');
        } else {
            logger.log('');
            logger.error('Unpublish fallito: exit code = ' + code);
        }
    });
};
