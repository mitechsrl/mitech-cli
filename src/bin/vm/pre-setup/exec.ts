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
import { createSshSession } from '../../../lib/ssh';
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction, StringError } from '../../../types';
import { linuxCmds } from './linux';
   
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const target = await getTarget();
    printTarget(target);

    if (!target) return;

    logger.log('');
    logger.info('Questo script eseguirà alcune verifiche al sistema remoto senza apportare alcuna modifica');
    logger.log('');

    const session = await createSshSession(target);
    if (session.os.linux) {
        await linuxCmds(session);
        logger.log('');
        logger.info('Tutti i test passati. Puoi procedere con il setup');
        session.disconnect();
    }else{
        session.disconnect();
        throw new StringError('Pre-setup script non disponibile per la piattaforma ' + JSON.stringify(session.os));
    }
};

export default exec;
    