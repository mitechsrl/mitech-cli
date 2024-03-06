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
import { SshTarget, StringError } from '../../../../../types';
import { logger } from '../../../../../lib/logger';
import { removeMyIpAddressFromGeoDyn } from '../_lib/removeMyIpAddressFromGeoDyn';

/**
 * Disable modalità manutenzione per environment docker
 * @param session 
 * @param target 
 */
export async function disableMaintenanceDocker(session: SshSession, target: SshTarget){

    const appUser = target.nodeUser || 'onit';
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteAppDir = await session.getRemoteHomeDir(appUser,'apps');
    const geoDynFileName= 'geo_dyn.conf';
    const remoteNginxVolumeDir = remoteAppDir+'/nginx';
    const remoteTempDirGeoDynFile = remoteTempDir+geoDynFileName;
    const remoteNginxMaintenanceModeVolumeDir = remoteNginxVolumeDir+'/maintenancemode';
    const remoteNginxGeoDynFile = remoteNginxMaintenanceModeVolumeDir+'/'+geoDynFileName;
    
    // cerco preventivamente l'id del container di nginx. Se non lo trovo è inutile continuare
    // ATTENZIONE: questo comando presuppone che il container docker contenga il nome "nginx"
    // Non è matematico che ci sia solo questo ma se ci sono 2 nginx forse c'è qualcosa di strano
    const nginxContainerId = await session.command('docker ps -f "name=nginx" | grep nginx | awk \'{print $1}\'');
    if (!nginxContainerId.output.trim()) {
        const strings = [
            'Impossibile trovare id container nginx. Modalità maintenance NON disattivata.',
            'Per farlo manualmente entra su server in ssh e fai le seguenti operazioni:',
            '- elimina il file di maintenance mode: < rm -f /home/onit/apps/nginx/maintenancemode/maintmode >',
            '- ottieni id container nginx: < docker ps >',
            '- reload nginx: <docker exec ID_CONTAINER /usr/sbin/nginx -s reload>'
        ];
        throw new StringError(strings.join('\n'));
    }
    
    // L'ip che ha abilitato la modalità manutenzione deve essere rimosso dalla lista geo_dyn
    await removeMyIpAddressFromGeoDyn(session, geoDynFileName, remoteNginxGeoDynFile, remoteTempDirGeoDynFile );

    // il maintenance mode lo si applica facendo touch di questo file.
    // NGINX è preconfigurato per dare http 503 con redirect verso il portale di
    // maintenance se trova questo file.
    // NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
    await session.command(`rm -f ${remoteNginxMaintenanceModeVolumeDir}/maintmode`);

    // Dopo il rm c'è da fare reload di nginx. Il reload di nginx non comporta downtime.
    logger.log('Reload nginx...');
    const reloadResult = await session.command(`sudo docker exec ${nginxContainerId.output.trim()} /usr/sbin/nginx -s reload`);
    if (reloadResult.exitCode !== 0 ){
        throw new StringError('Errore reload nginx');
    }
}