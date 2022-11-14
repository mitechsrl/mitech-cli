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

import path from 'path';
import yargs from 'yargs';
import { runTargetConfiguration } from '../../../../lib/runTargetConfiguration';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction } from '../../../../types';
import { presetupCheckConfirm } from '../../pre-setup/presetupCheckConfirm';
    
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const target = await getTarget();
    printTarget(target);
    if (!target) return;
 
    // always make sure you can run sudo commands without entering password
    await presetupCheckConfirm();

    await runTargetConfiguration(target, path.join(__dirname, './_configs'));
};
 
export default exec;
 