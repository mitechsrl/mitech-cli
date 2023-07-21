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
import fs from 'fs';
import fetch from 'node-fetch';
import { file } from 'tmp-promise';
import path from 'path';
import { validateIPaddress } from '../../_lib/validateIpAddress';
import { logger } from '../../../../../lib/logger';
import tar from 'tar';
import { uploadAndRunShFile } from '../../../../../lib/uploadShFile';

export async function enableMaintenanceDocker(session: SshSession, target: SshTarget){

    const response = await fetch('https://api.ipify.org');
    const body = (await response.text()).trim();

    // tmp filenames for upload
    const appUser = target.nodeUser || 'onit';
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteAppDir = await session.getRemoteHomeDir(appUser,'apps');
    const remoteNginxVolumeDir = remoteAppDir+'/nginx';
    const remoteTempDirGeoDynFile = remoteTempDir+'geo_dyn.conf';
    const remoteNginxGeoDynFile = remoteNginxVolumeDir+'/geo_dyn.conf';
    const remoteNginxMaintenanceVolumeDir = remoteNginxVolumeDir+'/maintenance';
    const remoteNginxMaintmodeVolumeDir = remoteNginxVolumeDir+'/maintmode';

    //  Update geo_dyn.conf
    if (!validateIPaddress(body)) {
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    } else {
        logger.log('Setto l\'ip locale ' + body + ' tra gli indirizzi ammessi al web service...');
        const tmpFile = await file({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile(remoteNginxGeoDynFile, tmpFile.path);
        await fs.promises.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, remoteTempDirGeoDynFile);
        await session.command(`sudo mv ${remoteTempDirGeoDynFile} ${remoteNginxGeoDynFile}`);
        tmpFile.cleanup();
    }

    // il portale viene ricaricato ogni volta, in modo da avere sempre la versione aggiornata
    logger.log('Carico il portale di maintenance...');
    const tarFile = await file({ discardDescriptor: true, postfix: '.tgz' });
    await tar.c({
        gzip: true,
        file: tarFile.path,
        cwd: path.join(__dirname, '../_html_files')
    }, ['./']);
    await session.uploadFile(tarFile.path, '/tmp/maintenance.tar.gz'); // carico l'archivio dei files
    tarFile.cleanup();

    // La serie (medio-lunga) di  comandi sono implementati via script bash, in modo da essere più veloce la scrittura del codice
    logger.log('Carico ed eseguo lo script bash di attivazione modalità manutenzione..');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, './docker.sh'),
        '/tmp/docker-maintenance-mode-enable.sh',
        [
            appUser,
            remoteNginxMaintenanceVolumeDir,
            remoteNginxMaintmodeVolumeDir
        ]
    );
    
}