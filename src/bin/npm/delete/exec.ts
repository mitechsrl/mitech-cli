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
import fs, { existsSync, unlinkSync } from 'fs';
import { logger } from '../../../lib/logger';
import { CommandExecFunction, StringError } from '../../../types';
import { npmScope } from '../npmConstants';
import { buildNpmrc, getRegistry, npmExecutable } from '../../../lib/npm';
import inquirer from 'inquirer';
import { spawn } from '../../../lib/spawn';
import { confirm } from '../../../lib/confirm';
import { join } from 'path';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    if (!argv.p) {
        throw new StringError('Specifica il pacchetto da rimuovere con "-p packageName"');
    }

    if (existsSync(join(process.cwd(), 'package.json'))){
        throw new StringError('Esegui questo comando in una cartella dove non è presente un file package.json!');
    }

    const packageName = argv.p;
    if (!await confirm(argv, 'Il pacchetto ' + packageName + ' verrà rimosso dal registry NPM Mitech. Sei sicuro?')){
        return;
    }

    // creo un .npmrc se serve. Serve per far loggare npm in auto sul registry
    const registry = await getRegistry(npmScope);
    const npmrcPath = join(process.cwd(),'./.npmrc');
    let deleteNpmRcFile = false;
    if (!existsSync(npmrcPath)){
        deleteNpmRcFile = true;
        fs.writeFileSync(npmrcPath, buildNpmrc(registry));
    }

    const npmParams = ['unpublish', packageName, '--registry', registry.registry, '--access', 'restricted', '--force'];
    logger.log('Eseguo npm ' + npmParams.join(' '));
    const npmResult = await spawn(npmExecutable, npmParams, true);

    if (deleteNpmRcFile){
        unlinkSync(npmrcPath);
    }

    if (npmResult.exitCode !== 0) {
        logger.error('Unpublish fallito: exit code = ' + npmResult.exitCode );
        return;
    }
    
    logger.info('Unpublish completo!');
    
};

export default exec;