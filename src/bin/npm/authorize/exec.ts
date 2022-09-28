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
import { CommandExecFunction } from '../../../types';
import { npmScope } from '../npmConstants';
import { buildNpmrc, getRegistry } from '../../../lib/npm';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    logger.log('Directory corrente: ' + process.cwd());
    logger.log('Preparo .npmrc...');
    logger.log('uso account  \'readonlyAccount\'');

    // creo un .npmrc. Serve per far loggare npm in auto sul registry
    const registry = await getRegistry(npmScope);
    fs.writeFileSync('.npmrc', buildNpmrc(registry, 'readonlyAccount'));

    logger.log('File .npmrc creato!');
};

export default exec;