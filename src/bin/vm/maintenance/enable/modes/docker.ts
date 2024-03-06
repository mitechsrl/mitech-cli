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
import fs from 'fs';
import fetch from 'node-fetch';
import { file } from 'tmp-promise';
import { validateIPaddress } from '../../_lib/validateIpAddress';
import { logger } from '../../../../../lib/logger';

/**
 * Su docker la modalità si attiva 
 * @param session 
 * @param target 
 */
export async function enableMaintenanceDocker(session: SshSession, target: SshTarget){
    
    // tmp filenames for upload
    const appUser = target.nodeUser || 'onit';
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteAppDir = await session.getRemoteHomeDir(appUser,'apps');
    const remoteNginxVolumeDir = remoteAppDir+'/nginx';
    const remoteTempDirGeoDynFile = remoteTempDir+'geo_dyn.conf';
    const remoteNginxMaintenanceModeVolumeDir = remoteNginxVolumeDir+'/maintenancemode';
    const remoteNginxGeoDynFile = remoteNginxMaintenanceModeVolumeDir+'/geo_dyn.conf';

    logger.warn('ATTENZIONE: Il maintenance mode presuppone il volume docker di nginx sia montato in  '+remoteNginxVolumeDir);
    
    // cerco preventivamente l'id del container di nginx perchè poi devo usarlo.
    // Se non lo trovo è inutile continuare
    // ATTENZIONE: questo comando presuppone che il container docker contenga il nome "nginx"
    // Non è matematico che ci sia solo questo ma se ci sono 2 nginx forse c'è qualcosa di strano
    const nginxContainerId = await session.command('docker ps -f "name=nginx" | grep nginx | awk \'{print $1}\'');
    if (!nginxContainerId.output.trim()) {
        throw new StringError('Impossibile trovare id container nginx. Modalità maintenance NON attivata.');
    }

    // Il maintenancemode permette comunque a chi l'ha attivato la visione del portale per poter fare
    // operazioni di manutenzione. Per farlo, nginx è configurato per far passare il traffico per IP.
    // Cerco l'ip della mia connessione tramite qualche api esterna
    logger.log('Cerco ip locale...');
    const response = await fetch('https://api.ipify.org');
    const body = (await response.text()).trim();
    
    //  Update geo_dyn.conf
    if (!validateIPaddress(body)) {
        // Fallback: vai vpn vedo sempre tutto (non setto l'ip qui, è preconfigurato nella config di nginx, vedi volume nginx di turno)
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    } else {
        // hurrààà ho l'ip locale... https://www.youtube.com/watch?v=tBm_RYreqIY
        logger.log('Complimenti! Il tuo ip locale è: ' + body); 
    
        // Scarico il file preesistente e gli aggiungo il mio ip, poi lo ricarico
        logger.log('Setto l\'ip tra gli indirizzi ammessi al web service...');
        const tmpFile = await file({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile(remoteNginxGeoDynFile, tmpFile.path);
        await fs.promises.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, remoteNginxGeoDynFile);
        // await session.command(`sudo mv ${remoteTempDirGeoDynFile} ${remoteNginxGeoDynFile}`);
        tmpFile.cleanup();
    }

    // il maintenance mode lo si applica facendo touch di questo file.
    // NGINX è preconfigurato per dare http 503 con redirect verso il portale di
    // maintenance se trova questo file.
    // NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
    await session.command(`touch ${remoteNginxMaintenanceModeVolumeDir}/maintmode`);
 
    // Dopo il touch c'è da fare reload di nginx. Il reload di nginx non comporta downtime.
    logger.log('Reload nginx...');
    const reloadResult = await session.command(`sudo docker exec ${nginxContainerId.output.trim()} /usr/sbin/nginx -s reload`);
    if (reloadResult.exitCode !== 0 ){
        throw new StringError('Errore reload nginx');
    }
    
}