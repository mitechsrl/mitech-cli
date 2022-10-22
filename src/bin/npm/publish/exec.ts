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
import { confirm } from '../../../lib/confirm';
import { spawn } from '../../../lib/spawn';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    /* step 1 ************************************************************************/
    logger.log('Directory corrente: ' + process.cwd());
    const registryIdParam = argv.r as string;

    /* step 1 ************************************************************************/
    logger.log('verifico package.json...');
    let packageJson = null;
    try {
        packageJson = JSON.parse(fs.readFileSync('package.json').toString());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new StringError('Errore lettura package.json: ' + e.message);
    }

    if (!packageJson.name.startsWith(npmScope + '/')) {
        throw new Error('Il pacchetto deve essere sotto scope @mitech. Rinominalo in @mitech/' + packageJson.name);
    }

    // conferma
    if (!await confirm(argv, 'Questa directory verrà pushata sul registry NPM. Sei sicuro di essere nella directory corretta?')){
        return;
    }

    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await getRegistry(npmScope, registryIdParam, true);

    /* step 2 ************************************************************************/
    logger.log('Preparo .npmrc...');
    if (fs.existsSync('.npmrc')) {
        fs.renameSync('.npmrc', '.npmrc-BACKUP');
    }

    fs.writeFileSync('.npmrc', buildNpmrc(registry));

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
    } catch (e:any) {
        throw new StringError('Impossibile aggiungere .npmrc a .npmignore: ' + e.message);
    }

    /* step 3 ************************************************************************/
    // eseguo comando
    const result = await spawn(npmExecutable, ['publish', '--registry', registryUrl, '--access', 'restricted'], true);

    try {
        // rimuovo il file .npmrc. Non serve oltre l'operazione npm
        fs.unlinkSync('.npmrc');
    } catch (e) {}
    if (fs.existsSync('.npmrc-BACKUP')) {
        fs.renameSync('.npmrc-BACKUP', '.npmrc');
    }

    if (result.exitCode === 0) {
        logger.info('Publish completo!');
    } else {
        logger.log('');
        logger.error('Publish fallito: exit code = ' + result.exitCode);
    }
};

export default exec;