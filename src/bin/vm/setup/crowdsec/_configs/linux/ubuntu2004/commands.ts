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
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { uploadAndRunShFile } from '../../../../../../../lib/uploadShFile';
 
async function command(session: SshSession){
    // carico il file setup-crowdsec.sh che contiene tutti i comandi bash da eseguire sul server
    logger.log('Upload e avvio setup-crowdsec.sh...');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, './setup-crowdsec.sh'),
        '/tmp/setup-crowdsec.sh'
    );

    logger.info('Setup completo!');
}

export default command;
