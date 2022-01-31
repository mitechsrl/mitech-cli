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

const target = require('../../../../lib/target');
const ssh = require('../../../../lib/ssh');
const path = require('path');
const tmp = require('tmp-promise');
const logger = require('../../../../lib/logger');
const tar = require('tar');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const { validateIPaddress } = require('./validateIpAddress');

module.exports.info = 'Abilita modalità maintenance. Solo connessioni in arrivo da vpn mitech sono autorizzate';
module.exports.help = [];

module.exports.cmd = async function (basepath, params) {
    const t = await target.get();
    target.print(t);

    const session = await ssh.createSshSession(t);

    const response = await fetch('https://api.ipify.org');
    const body = (await response.text()).trim();

    if (!validateIPaddress(body)) {
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    } else {
        logger.log('Setto l\'ip locale ' + body + ' tra gli indirizzi ammessi al web service...')
        const tmpFile = await tmp.file({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile('/etc/nginx/geo_dyn.conf', tmpFile.path);
        await fs.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, '/home/azureuser/geo_dyn.conf');
        await session.command('sudo mv /home/azureuser/geo_dyn.conf /etc/nginx/geo_dyn.conf');
        tmpFile.cleanup();
        await session.command('sudo systemctl reload nginx.service');
    }

    // il portale viene ricaricato ogni volta, in modo da avere sempre la versione aggiornata 
    logger.log('Carico il portale di maintenance...');
    const tarFile = await tmp.file({ discardDescriptor: true, postfix: '.tgz' });
    await tar.c({
        gzip: true,
        file: tarFile.path,
        cwd: path.join(__dirname, './_html_files')
    }, ['./']);

    // creo directory temporanee, carico il file, lo estraggo e lo copio dentro alla directory
    // finale di nginx
    await session.command('mkdir -p /home/azureuser/maintenance'); // crea path upload. Non fa nulla se esiste
    await session.command('rm -rf /home/azureuser/maintenance/*'); // rimuove i contenuti
    await session.command('sudo mkdir -p /var/www/maintenance'); // creo path per portale di maintenance
    await session.command('sudo rm -rf /var/www/maintenance/*'); // svuoto il portale di maintenance
    await session.uploadFile(tarFile.path, '/home/azureuser/maintenance.tar.gz'); // carico l'archivio dei files
    await session.command('tar -xf /home/azureuser/maintenance.tar.gz -C /home/azureuser/maintenance'); // spacchetto
    await session.command('sudo cp /home/azureuser/maintenance/* /var/www/maintenance'); // copio files nella directory destinazione
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

