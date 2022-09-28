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

import yargs from 'yargs';
import fs from 'fs';
import { logger } from '../../../lib/logger';
import { CommandExecFunction, StringError } from '../../../types';
import { npmScope } from '../npmConstants';
import { buildNpmrc, getRegistry, npmExecutable } from '../../../lib/npm';
import inquirer from 'inquirer';
import { spawn } from 'child_process';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    if (!argv.p) {
        throw new StringError('Specifica il pacchetto da rimuovere con "-p packageName"');
    }

    const packageName = argv.p;

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
    const registry = await getRegistry(npmScope);
    fs.writeFileSync('.npmrc', buildNpmrc(registry));

    const registryUrl = registry.registry;

    /* eseguo comando ************************************************************************/
    const npmParams = ['unpublish', packageName, '--registry', registryUrl, '--access', 'restricted', '--force'];
    logger.log('Eseguo npm ' + npmParams.join(' '));

    const npm = spawn(npmExecutable, npmParams, { stdio: 'inherit' });

    npm.on('error', (data) => {
        console.log(`error: ${data}`);
    });

    npm.on('exit', (code) => {
        try {
            // rimuovo il file .npmrc. Non serve oltre l'operazione npm
            // fs.unlinkSync('.npmrc');
        } catch (e) { }

        if (code === 0) {
            logger.info('Unpublish completo!');
        } else {
            logger.log('');
            logger.error('Unpublish fallito: exit code = ' + code);
        }
    });
};

export default exec;