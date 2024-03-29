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
import { confirm } from '../../../../lib/confirm';
import { logger } from '../../../../lib/logger';
import { runTargetConfiguration } from '../../../../lib/runTargetConfiguration';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction } from '../../../../types';
import { presetupCheckConfirm } from '../../pre-setup/presetupCheckConfirm';
   
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const target = await getTarget();
    printTarget(target);

    if (!target) return;

    // always make sure you can run sudo commands without entering password
    await presetupCheckConfirm();
    
    // Double check
    for (let i = 1;i<3; i++){
        logger.warn(''+i+'/2 ATTENZIONE! Questa procedura configura un disco aggiuntivo NUOVO, ed esegue una FORMATTAZIONE del disco in questione. Non usare questa procedura per connettere un disco già popolato! Per connettere un disco popolato, vedi https://learn.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal?tabs=ubuntu#attach-an-existing-disk');
        if (!await confirm(argv, 'Continuare?')){
            return;
        }
    }
    
    await runTargetConfiguration(target, path.join(__dirname, './_configs'));
};

export default exec;
