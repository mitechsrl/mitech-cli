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

import { createSshSession } from '../../../../lib/ssh';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction } from '../../../../types';
import fs from 'fs';
import fetch from 'node-fetch';
import { file } from 'tmp-promise';
import path from 'path';
import { validateIPaddress } from '../_lib/validateIpAddress';
import { logger } from '../../../../lib/logger';
import yargs from 'yargs';
import tar from 'tar';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {

    const t = await getTarget();
    printTarget(t);

    const session = await createSshSession(t);

    const response = await fetch('https://api.ipify.org');
    const body = (await response.text()).trim();

    if (!validateIPaddress(body)) {
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    } else {
        logger.log('Setto l\'ip locale ' + body + ' tra gli indirizzi ammessi al web service...');
        const tmpFile = await file({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile('/etc/nginx/geo_dyn.conf', tmpFile.path);
        await fs.promises.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, '/tmp/geo_dyn.conf');
        await session.command('sudo mv /tmp/geo_dyn.conf /etc/nginx/geo_dyn.conf');
        tmpFile.cleanup();
        await session.command('sudo systemctl reload nginx.service');
    }

    // il portale viene ricaricato ogni volta, in modo da avere sempre la versione aggiornata
    logger.log('Carico il portale di maintenance...');
    const tarFile = await file({ discardDescriptor: true, postfix: '.tgz' });
    await tar.c({
        gzip: true,
        file: tarFile.path,
        cwd: path.join(__dirname, './_html_files')
    }, ['./']);

    // creo directory temporanee, carico il file, lo estraggo e lo copio dentro alla directory
    // finale di nginx
    await session.command('mkdir -p /tmp/maintenance'); // crea path upload. Non fa nulla se esiste
    await session.command('rm -rf /tmp/maintenance/*'); // rimuove i contenuti
    await session.command('sudo mkdir -p /var/www/maintenance'); // creo path per portale di maintenance
    await session.command('sudo rm -rf /var/www/maintenance/*'); // svuoto il portale di maintenance
    await session.uploadFile(tarFile.path, '/tmp/maintenance.tar.gz'); // carico l'archivio dei files
    await session.command('tar -xf /tmp/maintenance.tar.gz -C /tmp/maintenance'); // spacchetto
    await session.command('sudo cp /tmp/maintenance/* /var/www/maintenance'); // copio files nella directory destinazione
    await session.command('sudo chown -R www-data:www-data /var/www/maintenance'); // fix owner files
    await session.command('sudo chmod -R 755 /var/www/maintenance'); // fix permessi files

    // set the nginx config
    logger.log('Creo file lock di maintenance mode...');

    // il maintenance mode lo si applica facendo touch di questo file.
    // NGINX è preconfigurato per dare http 503 con redirect verso il portale di
    // maintenance se trova questo file.
    // NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
    // Vedi E:\progetti\mitech-cli\bin\vm\setup\node\_configs\linux\ubuntu2004_node14\nginx-default.conf
    await session.command('sudo touch /var/www/maintmode');
    tarFile.cleanup();

    session.disconnect();
};

export default exec;
