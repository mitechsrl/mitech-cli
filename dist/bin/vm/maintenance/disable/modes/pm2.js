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
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableMaintenancePm2 = void 0;
const logger_1 = require("../../../../../lib/logger");
const removeMyIpAddressFromGeoDyn_1 = require("../_lib/removeMyIpAddressFromGeoDyn");
/**
 * Disable modalità manutenzione per environment pm2
 *
 * @param session
 * @param target
 */
async function disableMaintenancePm2(session, target) {
    const geoDynFileName = 'geo_dyn.conf';
    const remoteTempDirGeoDynFile = '/tmp/' + geoDynFileName;
    const remoteNginxGeoDynFile = '/etc/nginx/' + geoDynFileName;
    // L'ip che ha abilitato la modalità manutenzione deve essere rimosso dalla lista geo_dyn
    await (0, removeMyIpAddressFromGeoDyn_1.removeMyIpAddressFromGeoDyn)(session, geoDynFileName, remoteNginxGeoDynFile, remoteTempDirGeoDynFile);
    // set the nginx config
    logger_1.logger.log('Rimuovo file lock di maintenance mode...');
    await session.command('sudo rm -rf /var/www/maintmode');
    await session.command('sudo systemctl reload nginx.service');
    logger_1.logger.success('Modalità maintenance disattivata');
}
exports.disableMaintenancePm2 = disableMaintenancePm2;
//# sourceMappingURL=pm2.js.map