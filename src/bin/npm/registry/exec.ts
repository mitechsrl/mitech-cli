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
import { logger } from '../../../lib/logger';
import { CommandExecFunction } from '../../../types';
import { getNpmPersistent } from '../../../lib/npm';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const registries = getNpmPersistent();

    if (registries.length === 0) {
        logger.log('Non sono presenti regisrty npm. Use <mitech npm registry add> per creare uno');
        return;
    }

    logger.log('');
    registries.forEach(element => {
        logger.info('ID: ' + element.id);
        logger.log('  scope: ' + element.scope);
        logger.log('  registry: ' + element.registry);
        logger.log('');
    });
};

export default exec;