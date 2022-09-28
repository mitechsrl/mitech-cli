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
import { logger } from '../../../../lib/logger';
import { CommandExecFunction } from '../../../../types';
import { getNpmPersistent, getRegistry, setNpmPersistent } from '../../../../lib/npm';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    
    const registry = await getRegistry(undefined, undefined, false);
    if (!registry) return;

    let npmInfo = getNpmPersistent();
    npmInfo = npmInfo.filter(r => r.id !== registry.id);
    setNpmPersistent(npmInfo);
    logger.log('Registry rimosso!');
};

export default exec;