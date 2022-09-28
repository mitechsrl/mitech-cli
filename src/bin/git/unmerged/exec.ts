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
    const unmergedBranchList = await spawn('git', ['branch', '-a', '--no-merged'], false);
    logger.log(unmergedBranchList.output);
};

export default exec;
