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
import { CommandExecFunction } from '../../../types';
  
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const t = await getTarget();
    printTarget(t);
    logger.log('');
    const session = await createSshSession(t);
    logger.log('Eseguo <sudo reboot -h now>');
    await session.command('sudo reboot -h now');
    logger.success('Reboot lanciato');
    session.disconnect();
};

export default exec;
