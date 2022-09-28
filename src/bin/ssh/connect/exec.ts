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
import { CommandExecFunction } from '../../../types';
import { getTarget, printTarget } from '../../../lib/targets';
import { interativeClient } from '../../../lib/ssh';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const target = await getTarget();
    printTarget(target);
    interativeClient(target, argv._.slice(2).map(v => v.toString()));
};

export default exec;

