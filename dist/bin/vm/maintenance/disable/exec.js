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
const ssh_1 = require("../../../../lib/ssh");
const targets_1 = require("../../../../lib/targets");
const types_1 = require("../../../../types");
const pm2_1 = require("./modes/pm2");
const docker_1 = require("./modes/docker");
const logger_1 = require("../../../../lib/logger");
const exec = async (argv) => {
    const t = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(t);
    const session = await (0, ssh_1.createSshSession)(t);
    switch (t.environment) {
        case 'pm2':
            await (0, pm2_1.disableMaintenancePm2)(session, t);
            break;
        case 'docker':
            await (0, docker_1.disableMaintenanceDocker)(session, t);
            break;
        default: throw new types_1.StringError('Unknown environment mode');
    }
    logger_1.logger.success('Modalità maintenance disattivata');
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map