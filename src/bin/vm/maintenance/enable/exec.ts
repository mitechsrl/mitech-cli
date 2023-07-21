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

import { createSshSession } from '../../../../lib/ssh';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction, StringError } from '../../../../types';
import { logger } from '../../../../lib/logger';
import yargs from 'yargs';
import { enableMaintenancePm2 } from './modes/pm2';
import { enableMaintenanceDocker } from './modes/docker';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {

    const t = await getTarget();
    printTarget(t);

    const session = await createSshSession(t);

    switch (t.environment){
    case 'pm2': await enableMaintenancePm2(session, t); break;
    case 'docker': await enableMaintenanceDocker(session, t); break;
    default: throw new StringError('Unknown environment mode');
    }

    logger.success('Modalità maintenance attiva');

    session.disconnect();
};

export default exec;
