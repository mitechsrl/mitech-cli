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
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction } from '../../../types';
import { deploy } from './_lib/deploy';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const target = await getTarget(argv);
    if (!target) return;
    printTarget(target);

    await deploy(target, argv);
    // --store test-kv-1-abb-mitech deve essere uguale a quello definito in trustpolicy.json
    // notation cert add --type ca --store test-kv-1-abb-mitech test-cert-1-acr.cert

    // notation policy import ./trustpolicy.json (deve sovrascrivere config attuale)
};

export default exec;