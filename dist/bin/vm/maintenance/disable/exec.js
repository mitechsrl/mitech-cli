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
const validateIpAddress_1 = require("../_lib/validateIpAddress");
const logger_1 = require("../../../../lib/logger");
const exec = async (argv) => {
    const t = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(t);
    const session = await (0, ssh_1.createSshSession)(t);
    const response = await (0, node_fetch_1.default)('https://api.ipify.org');
    const ip = (await response.text()).trim();
    if (!(0, validateIpAddress_1.validateIPaddress)(ip)) {
        console.warn('Impossibile rimuovere l\'indirizzo ip locale da /etc/nginx/geo_dyn.conf');
    }
    else {
        console.warn('Rimuovo ip locale ' + ip + ' da /etc/nginx/geo_dyn.conf');
        const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile('/etc/nginx/geo_dyn.conf', tmpFile.path);
        const fileContent = (await fs_1.default.promises.readFile(tmpFile.path)).toString();
        let fileContentLines = fileContent.split('\n');
        fileContentLines = fileContentLines.filter(l => l.indexOf(ip) < 0);
        await fs_1.default.promises.writeFile(tmpFile.path, fileContentLines.join('\n'));
        await session.uploadFile(tmpFile.path, '/tmp/geo_dyn.conf');
        await session.command('sudo mv /tmp/geo_dyn.conf /etc/nginx/geo_dyn.conf');
        tmpFile.cleanup();
        await session.command('sudo systemctl reload nginx.service');
    }
    // set the nginx config
    logger_1.logger.log('Rimuovo file lock di maintenance mode...');
    await session.command('sudo rm -rf /var/www/maintmode');
    logger_1.logger.success('Modalità maintenance disattivata');
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map