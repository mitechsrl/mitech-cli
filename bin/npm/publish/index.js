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
const { spawn } = require('child_process');
const inquirer = require('inquirer');
const npmUtils = require('../utils');
const logger = require('../../../lib/logger');

const scope = '@mitech';

module.exports.info = 'Prepara e pubblica sul registry NPM Mitech la directory corente';
module.exports.help = [
    ['-y', 'Accetta automaticamente le richieste di conferma'],
    ['-r ID', 'Usa per default il registry identificato da id']
];
module.exports.cmd = async function (basepath, params) {
    /* step 1 ************************************************************************/
    logger.debug('Directory corrente: ' + process.cwd());
    const registryIdParam = params.get('-r');

    const cwd = process.cwd();

    // just add a warnign to tell the user we are not in a subdirectory of 'build' and maybe this is an error
    if (!cwd.match(/\\build\\.+/g) && !cwd.match(/\/build\/.+/g)) {
        logger.warn('Il path corrente non sembra essere una directory di build!');
    }

    /* step 1 ************************************************************************/
    logger.log('verifico package.json...');
    let packageJson = null;
    try {
        packageJson = JSON.parse(fs.readFileSync('package.json'));
    } catch (e) {
        throw new Error('Errore lettura package.json: ' + e.message);
    }

    if (!packageJson.name.startsWith(scope + '/')) {
        throw new Error('Il pacchetto deve essere sotto scope @mitech. Rinominalo in @mitech/' + packageJson.name);
    }

    // conferma
    try {
        if (!params.find(p => p === '-y')) { // auto yes if a param exists
            const response = await inquirer.prompt({
                type: 'confirm',
                name: 'value',
                message: 'Questa directory verrà pushata sul registry NPM. Sei sicuro di essere nella directory corretta? '
            });
            if (!response.value) return;
        }
    } catch (e) {
        return;
    }

    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await npmUtils.getRegistry(scope, registryIdParam.found ? registryIdParam.value : null, true);

    /* step 2 ************************************************************************/
    logger.log('Preparo .npmrc...');
    if (fs.existsSync('.npmrc')) {
        fs.renameSync('.npmrc', '.npmrc-BACKUP');
    }

    fs.writeFileSync('.npmrc', npmUtils.buildNpmrc(registry));

    const registryUrl = registry.registry;

    /* step 3 ************************************************************************/
    logger.log('Preparo .npmignore...');
    try {
        if (fs.existsSync('.npmignore')) {
            // .npmignore esiste già. Ci metto dentro .npmrc in modo da non spararlo sul registry
            let npmignore = fs.readFileSync('.npmignore').toString();
            const haveIgnore = npmignore.split('\n').map(r => r.trim()).filter(r => r === '.npmrc').length > 0;
            if (!haveIgnore) {
                npmignore = npmignore + '\n.npmrc\n.npmrc-BACKUP';
                fs.writeFileSync('.npmignore', npmignore);
            }
        } else {
            // .npmignore non esiste. Lo creo mettendoci dentro .npmrc in modo da non spararlo sul registry
            fs.writeFileSync('.npmignore', '.npmrc\n.npmrc-BACKUP');
        }
    } catch (e) {
        throw new Error('Impossibile aggiungere .npmrc a .npmignore: ' + e.message);
    }

    /* step 3 ************************************************************************/
    // eseguo comando
    const npmParams = ['publish', '--registry', registryUrl, '--access', 'restricted'];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    const npm = spawn(npmUtils.npmExecutable, npmParams, { stdio: 'inherit' });

    npm.on('error', (data) => {
        console.log(`error: ${data}`);
    });

    npm.on('exit', (code) => {
        try {
            // rimuovo il file .npmrc. Non serve oltre l'operazione npm
            fs.unlinkSync('.npmrc');
        } catch (e) { }
        if (fs.existsSync('.npmrc-BACKUP')) {
            fs.renameSync('.npmrc-BACKUP', '.npmrc');
        }

        if (code === 0) {
            logger.info('Publish completo!');
        } else {
            logger.log('');
            logger.error('Publish fallito: exit code = ' + code);
        }
    });
};
