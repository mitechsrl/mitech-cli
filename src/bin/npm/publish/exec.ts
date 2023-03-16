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
import { getRegistry, npmExecutable } from '../../../lib/npm';
import { confirm } from '../../../lib/confirm';
import { spawn } from '../../../lib/spawn';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
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

    /* step 3 ************************************************************************/
    /*
    IV: 19-12-2022 Per via di
        https://medium.com/@jdxcode/for-the-love-of-god-dont-use-npmignore-f93c08909d8d
        cerco di deprecare l'uso di npmignore.
        I progetti che lo usano coninuno ad averlo finchè il dev non lo gestisce in alto modo,
        ma se non c'è non viene icreato.
        NOTA: contestualmente l'uso di "files" in package.json riduce i files pacchettizzati
    */
    try {
        if (fs.existsSync('.npmignore')) {
            logger.log('Update .npmignore...');
            // .npmignore esiste già. Ci metto dentro .npmrc in modo da non spararlo sul registry
            let npmignore = fs.readFileSync('.npmignore').toString();
            const haveIgnore = npmignore.split('\n').map(r => r.trim()).filter(r => r === '.npmrc').length > 0;
            if (!haveIgnore) {
                npmignore = npmignore + '\n.npmrc\n';
                fs.writeFileSync('.npmignore', npmignore);
            }
        }
    } catch (e: any) {
        throw new StringError('Update .npmignore fallito: ' + e.message);
    }

    /* step 3 ************************************************************************/
    // eseguo comando
    const npmParams = [
        'publish',
        '--userconfig', registry.npmrcPath, 
        '--registry', registry.registry, 
        '--access', 'restricted'
    ];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    const result = await spawn(npmExecutable, npmParams, true);

    if (result.exitCode === 0) {
        logger.info('Publish completo!');
    } else {
        logger.log('');
        logger.error('Publish fallito: exit code = ' + result.exitCode);
    }
};

export default exec;