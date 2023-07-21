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
import path from 'path';
import { logger } from '../../../../../lib/logger';
import { uploadAndRunShFile } from '../../../../../lib/uploadShFile';
import { removeMyIpAddressFromGeoDyn } from '../_lib/removeMyIpAddressFromGeoDyn';

/**
 * * Disable modalità manutenzione per environment docker
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
    const remoteNginxGeoDynFile = remoteNginxVolumeDir+'/'+geoDynFileName;
    const remoteNginxMaintenanceVolumeDir = remoteNginxVolumeDir+'/maintenance';
    const remoteNginxMaintmodeVolumeDir = remoteNginxVolumeDir+'/maintmode';

    // L'ip che ha abilitato la modalità manutenzione deve essere rimosso dalla lista geo_dyn
    await removeMyIpAddressFromGeoDyn(session, geoDynFileName, remoteNginxGeoDynFile,remoteTempDirGeoDynFile );

    // La serie (medio-lunga) di  comandi sono implementati via script bash, in modo da essere più veloce la scrittura del codice
    logger.log('Carico ed eseguo lo script bash di disattivazione modalità manutenzione..');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, './docker.sh'),
        '/tmp/docker-maintenance-mode-disable.sh',
        [
            appUser,
            remoteNginxMaintenanceVolumeDir,
            remoteNginxMaintmodeVolumeDir
        ]
    );
}