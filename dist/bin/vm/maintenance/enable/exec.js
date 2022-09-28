"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh_1 = require("../../../../lib/ssh");
const targets_1 = require("../../../../lib/targets");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const tmp_promise_1 = require("tmp-promise");
const path_1 = __importDefault(require("path"));
const validateIpAddress_1 = require("../_lib/validateIpAddress");
const logger_1 = require("../../../../lib/logger");
const tar_1 = __importDefault(require("tar"));
const exec = async (argv) => {
    const t = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(t);
    const session = await (0, ssh_1.createSshSession)(t);
    const response = await (0, node_fetch_1.default)('https://api.ipify.org');
    const body = (await response.text()).trim();
    if (!(0, validateIpAddress_1.validateIPaddress)(body)) {
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    }
    else {
        logger_1.logger.log('Setto l\'ip locale ' + body + ' tra gli indirizzi ammessi al web service...');
        const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile('/etc/nginx/geo_dyn.conf', tmpFile.path);
        await fs_1.default.promises.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, '/tmp/geo_dyn.conf');
        await session.command('sudo mv /tmp/geo_dyn.conf /etc/nginx/geo_dyn.conf');
        tmpFile.cleanup();
        await session.command('sudo systemctl reload nginx.service');
    }
    // il portale viene ricaricato ogni volta, in modo da avere sempre la versione aggiornata
    logger_1.logger.log('Carico il portale di maintenance...');
    const tarFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.tgz' });
    await tar_1.default.c({
        gzip: true,
        file: tarFile.path,
        cwd: path_1.default.join(__dirname, './_html_files')
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
    logger_1.logger.log('Creo file lock di maintenance mode...');
    // il maintenance mode lo si applica facendo touch di questo file.
    // NGINX è preconfigurato per dare http 503 con redirect verso il portale di
    // maintenance se trova questo file.
    // NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
    // Vedi E:\progetti\mitech-cli\bin\vm\setup\node\_configs\linux\ubuntu2004_node14\nginx-default.conf
    await session.command('sudo touch /var/www/maintmode');
    tarFile.cleanup();
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map