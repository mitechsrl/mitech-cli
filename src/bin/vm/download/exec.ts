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
import path from 'path';
import fs from 'fs';
import { logger } from '../../../lib/logger';
import { createSshSession } from '../../../lib/ssh';
import { getTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction, StringError } from '../../../types';
   
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {

    const remoteFile = argv.s as string;
    const destinationfile = argv.d as string;
    if (!remoteFile) {
        throw new StringError('Nessun file specificato. Usa -s per specificare il path del file sul sistema remoto');
    }

    const target = await getTarget();
    printTarget(target);

    // connect to ssh remote target
    const session = await createSshSession(target);
    let fileName = path.basename(remoteFile);
    if (destinationfile) {
        fileName = path.join(destinationfile, fileName);
    }
    logger.log('Scarico ' + remoteFile);

    const start = new Date();
    await session.downloadFile(remoteFile, fileName);
    const end = new Date();

    const stats = fs.statSync(fileName);
    logger.log('Download completato, ' + (stats.size / (1024 * 1024)).toFixed(2) + ' Mb in ' + ((end.getTime() - start.getTime()) / 1000).toFixed(0) + ' sec');
    logger.log('File destinazione: ' + fileName);
    session.disconnect();
    
};

export default exec;
