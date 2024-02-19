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
exports.enableMaintenanceDocker = void 0;
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const tmp_promise_1 = require("tmp-promise");
const path_1 = __importDefault(require("path"));
const validateIpAddress_1 = require("../../_lib/validateIpAddress");
const logger_1 = require("../../../../../lib/logger");
const tar_1 = __importDefault(require("tar"));
const uploadShFile_1 = require("../../../../../lib/uploadShFile");
async function enableMaintenanceDocker(session, target) {
    // tmp filenames for upload
    const appUser = target.nodeUser || 'onit';
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteAppDir = await session.getRemoteHomeDir(appUser, 'apps');
    const remoteNginxVolumeDir = remoteAppDir + '/nginx';
    const remoteTempDirGeoDynFile = remoteTempDir + 'geo_dyn.conf';
    const remoteNginxGeoDynFile = remoteNginxVolumeDir + '/geo_dyn.conf';
    // contiene files html per pagina manutenzione
    const remoteNginxMaintenanceVolumeDir = remoteNginxVolumeDir + '/maintenance';
    // contiene files per attivare la modalità manutenzione
    const remoteNginxMaintenanceModeVolumeDir = remoteNginxVolumeDir + '/maintenancemode';
    logger_1.logger.warn('ATTENZIONE: Il maintenance mode presuppone il volume docker di nginx sia montato in  ' + remoteNginxVolumeDir);
    logger_1.logger.log('Cerco ip locale...');
    const response = await (0, node_fetch_1.default)('https://api.ipify.org');
    const body = (await response.text()).trim();
    //  Update geo_dyn.conf
    if (!(0, validateIpAddress_1.validateIPaddress)(body)) {
        console.warn('Impossibile settare indirizzo ip locale come abilitato. Il portale è visibile solo tramite vpn mitech');
    }
    else {
        // ho l'ip locale... mecojoni!!
        logger_1.logger.log('Complimenti! Il tuo ip locale è: ' + body);
        logger_1.logger.log('Setto l\'ip tra gli indirizzi ammessi al web service...');
        const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile(remoteNginxGeoDynFile, tmpFile.path);
        await fs_1.default.promises.appendFile(tmpFile.path, '\n' + body + ' allowed;\n');
        await session.uploadFile(tmpFile.path, remoteTempDirGeoDynFile);
        await session.command(`sudo mv ${remoteTempDirGeoDynFile} ${remoteNginxGeoDynFile}`);
        tmpFile.cleanup();
    }
    // il portale viene ricaricato ogni volta, in modo da avere sempre la versione aggiornata
    logger_1.logger.log('Carico il portale di maintenance...');
    const tarFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.tgz' });
    await tar_1.default.c({
        gzip: true,
        file: tarFile.path,
        cwd: path_1.default.join(__dirname, '../_html_files')
    }, ['./']);
    await session.uploadFile(tarFile.path, '/tmp/maintenance.tar.gz'); // carico l'archivio dei files
    tarFile.cleanup();
    // La serie (medio-lunga) di  comandi sono implementati via script bash, in modo da essere più veloce la scrittura del codice
    logger_1.logger.log('Carico ed eseguo lo script bash di attivazione modalità manutenzione..');
    await (0, uploadShFile_1.uploadAndRunShFile)(session, path_1.default.join(__dirname, './docker.sh'), '/tmp/docker-maintenance-mode-enable.sh', [
        appUser,
        remoteNginxMaintenanceVolumeDir,
        remoteNginxMaintenanceModeVolumeDir
    ]);
}
exports.enableMaintenanceDocker = enableMaintenanceDocker;
//# sourceMappingURL=docker.js.map