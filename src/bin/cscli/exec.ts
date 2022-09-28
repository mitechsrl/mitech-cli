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
import { errorHandler } from '../../lib/errorHandler';
import { logger } from '../../lib/logger';
import { createSshSession } from '../../lib/ssh';
import { getTarget, printTarget } from '../../lib/targets';
import { CommandExecFunction, StringError } from '../../types';
 
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    
    const params = argv._.slice(1) as string[];
    if (params.length === 0) {
        logger.warn('Nessun comando eseguito. Digita <mitech cscli -h>  per info');
        return;
    }

    const target = await getTarget();
    printTarget(target);
    
    const session = await createSshSession(target);
    try {
        if (session.os.linux) {
            await session.command(['sudo', 'cscli', ...params], true);
        } else {
            throw new StringError('cscli non implementata per os su questa vm');
        }
    } catch (e: unknown) {
        errorHandler(e);
    }
    session.disconnect();
};

export default exec;