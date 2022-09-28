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

import _ from 'lodash';
import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { getMitechCliFile } from '../../../lib/mitechCliFile';
import { CommandExecFunction } from '../../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const mitechCliFile = await getMitechCliFile();
    const targets = mitechCliFile.content.targets ?? [];

    if (!targets || targets.length === 0) {
        return logger.error('Nessuna lista target disponibile in questa posizione');
    }

    logger.log('');
    logger.info('File: ' + mitechCliFile.file);
    logger.log('');

    targets.forEach(target => {
        logger.info(target.name);
        logger.log(JSON.stringify(_.omit(target, ['name', 'password']), null, 4));
    });
};

export default exec;
