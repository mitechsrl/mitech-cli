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

const inquirer = require('inquirer');
const persistent = require('../../lib/persistent');

/**
 * ottiene url del registry per lo scope scelto
 */
const getRegistry = async function (scope, defaultRegistryId = null, defaultIfSingle = true) {
    try {
        let registries = persistent.get('npm');
        if (!Array.isArray(registries) && Object.keys(registries).length === 0) {
            registries = [];
        }

        if (scope) {
            registries = registries.filter(r => r.scope === scope);
        }

        if (registries.length === 0) {
            let settings = [];
            if (scope) settings.push('scope: ' + scope);
            if (defaultRegistryId) settings.push('id: ' + defaultRegistryId);
            settings = settings.join(',');
            settings = settings !== '' ? 'per ' + settings : '';
            throw new Error('Nessun registro npm definito ' + settings + '. Usa <mitech npm registry add> per crearne uno');
        }

        // do we have something passed as parameter?
        if (defaultRegistryId) {
            const defaultRegistry = registries.find(r => r.id === defaultRegistryId);
            if (defaultRegistry) return defaultRegistry;
        }

        if (defaultIfSingle && registries.length === 1) return registries[0];

        // ask the user for registry
        const questions = [{
            type: 'list',
            name: 'registry',
            message: 'Seleziona un registry',
            choices: registries.map(r => ({ name: r.id + ' (scope: ' + r.scope + ', url: ' + r.registry + ')', value: r }))
        }];
        const answers = await inquirer.prompt(questions);
        return answers.registry;
    } catch (e) {
        throw new Error(e.message || e);
    }
};

/**
 * Costruisce il contenuto del file .npmrc con le credenziali per il registry di turno
 */
const buildNpmrc = function (registry, account = 'managementAccount') {
    try {
        const hostname = new URL(registry.registry).hostname;

        let npmrc = 'registry=https://registry.npmjs.org/\r\n';
        npmrc = npmrc + registry.scope + ':registry=' + registry.registry + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:username=' + registry[account].username + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:_password=' + Buffer.from(registry[account].password).toString('base64');

        return npmrc;
    } catch (e) {
        throw e.message || e;
    }
};

// windows fa il windows percui lui vuole 'npm.cmd' anzichè 'npm' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');

module.exports.npmExecutable = isWindows ? 'npm.cmd' : 'npm';
module.exports.buildNpmrc = buildNpmrc;
module.exports.getRegistry = getRegistry;
