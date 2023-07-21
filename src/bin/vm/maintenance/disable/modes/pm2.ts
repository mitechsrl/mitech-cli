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

import { SshSession } from '../../../../../lib/ssh';
import { SshTarget } from '../../../../../types';
import { logger } from '../../../../../lib/logger';
import { removeMyIpAddressFromGeoDyn } from '../_lib/removeMyIpAddressFromGeoDyn';

/**
 * Disable modalità manutenzione per environment pm2
 * 
 * @param session 
 * @param target 
 */
export async function disableMaintenancePm2(session: SshSession, target: SshTarget){

    const geoDynFileName = 'geo_dyn.conf';
    const remoteTempDirGeoDynFile = '/tmp/'+geoDynFileName;
    const remoteNginxGeoDynFile = '/etc/nginx/'+geoDynFileName;

    // L'ip che ha abilitato la modalità manutenzione deve essere rimosso dalla lista geo_dyn
    await removeMyIpAddressFromGeoDyn(session, geoDynFileName, remoteNginxGeoDynFile, remoteTempDirGeoDynFile );

    // set the nginx config
    logger.log('Rimuovo file lock di maintenance mode...');
    await session.command('sudo rm -rf /var/www/maintmode');

    await session.command('sudo systemctl reload nginx.service');
    
    logger.success('Modalità maintenance disattivata');
}