import { SshSession } from '../../../../../lib/ssh';
import { validateIPaddress } from '../../_lib/validateIpAddress';
import { file } from 'tmp-promise';
import fs from 'fs';

export async function removeMyIpAddressFromGeoDyn(session: SshSession, geoDynFileName: string, remoteNginxGeoDynFile: string, remoteTempDirGeoDynFile:string){
    const response = await fetch('https://api.ipify.org');
    const ip = (await response.text()).trim();

    if (!validateIPaddress(ip)) {
        console.warn('Impossibile rimuovere l\'indirizzo ip locale da '+geoDynFileName);
        return;
    } 

    console.warn(`Rimuovo ip locale ${ip} da ${geoDynFileName}`);

    // Prima scarico il file su server
    const tmpFile = await file({ discardDescriptor: true, postfix: '.conf' });
    await session.downloadFile(remoteNginxGeoDynFile, tmpFile.path);

    // Leggo il file e lo splitto per righe. Dobbiamo eliminare quella contenente il nostro ip
    const fileContent = (await fs.promises.readFile(tmpFile.path)).toString();
    let fileContentLines = fileContent.split('\n');
    fileContentLines = fileContentLines.filter(l => l.indexOf(ip) < 0);

    // riscrivo il file e lo ricarico su server
    await fs.promises.writeFile(tmpFile.path, fileContentLines.join('\n'));
    await session.uploadFile(tmpFile.path, remoteTempDirGeoDynFile);
    await session.command(`sudo mv ${remoteTempDirGeoDynFile} ${remoteNginxGeoDynFile}`);

    // rile temporaneo non piu utile. Viene buttato via.
    tmpFile.cleanup();
    
}