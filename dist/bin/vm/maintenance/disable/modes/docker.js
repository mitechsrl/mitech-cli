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
exports.disableMaintenanceDocker = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../../../lib/logger");
const uploadShFile_1 = require("../../../../../lib/uploadShFile");
const removeMyIpAddressFromGeoDyn_1 = require("../_lib/removeMyIpAddressFromGeoDyn");
/**
 * * Disable modalità manutenzione per environment docker
 * @param session
 * @param target
 */
async function disableMaintenanceDocker(session, target) {
    const appUser = target.nodeUser || 'onit';
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteAppDir = await session.getRemoteHomeDir(appUser, 'apps');
    const geoDynFileName = 'geo_dyn.conf';
    const remoteNginxVolumeDir = remoteAppDir + '/nginx';
    const remoteTempDirGeoDynFile = remoteTempDir + geoDynFileName;
    const remoteNginxGeoDynFile = remoteNginxVolumeDir + '/' + geoDynFileName;
    const remoteNginxMaintenanceVolumeDir = remoteNginxVolumeDir + '/maintenance';
    const remoteNginxMaintmodeVolumeDir = remoteNginxVolumeDir + '/maintmode';
    // L'ip che ha abilitato la modalità manutenzione deve essere rimosso dalla lista geo_dyn
    await (0, removeMyIpAddressFromGeoDyn_1.removeMyIpAddressFromGeoDyn)(session, geoDynFileName, remoteNginxGeoDynFile, remoteTempDirGeoDynFile);
    // La serie (medio-lunga) di  comandi sono implementati via script bash, in modo da essere più veloce la scrittura del codice
    logger_1.logger.log('Carico ed eseguo lo script bash di disattivazione modalità manutenzione..');
    await (0, uploadShFile_1.uploadAndRunShFile)(session, path_1.default.join(__dirname, './docker.sh'), '/tmp/docker-maintenance-mode-disable.sh', [
        appUser,
        remoteNginxMaintenanceVolumeDir,
        remoteNginxMaintmodeVolumeDir
    ]);
}
exports.disableMaintenanceDocker = disableMaintenanceDocker;
//# sourceMappingURL=docker.js.map