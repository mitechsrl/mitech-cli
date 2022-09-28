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

import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { CommandExecFunction } from '../../../types';

const exec: CommandExecFunction = async () => {
    logger.log('Autofetch...');

    // faccio fetch per avere info sulle commit in master
    await spawn('git', ['fetch'], false);
    const status = await spawn('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }

    const lastTag = await spawn('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode !== 0) || (!lastTag.output)) {
        logger.error(':collision: Impossibile trovare un tag ');
        return;
    }

    const _count = await spawn('git', ['rev-list', '--count', lastTag.output.trim() + '..HEAD'], false);
    const count = parseInt(_count.output.trim());

    logger.info('\nUltimo tag trovato: ' + lastTag.output.trim() + '\n');
    if (count === 0) {
        logger.log('Non ci sono commit dal tag ' + lastTag.output.trim());
    } else {
        logger.warn('Sono state trovate ' + count + ' commit dal tag ' + lastTag.output.trim() + '\n');
        const commitsFromTag = await spawn('git', ['log', lastTag.output.trim() + '..HEAD', '--pretty=format:"%h - %an - %s - %ad"'], false);
        logger.log(commitsFromTag.output);
    }
};

export default exec;