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
const logger_1 = require("../../../../lib/logger");
const ssh_1 = require("../../../../lib/ssh");
const targets_1 = require("../../../../lib/targets");
const deployScript_1 = require("../../_lib/deployScript");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    if (!target)
        return;
    (0, targets_1.printTarget)(target);
    const nodeUser = target.nodeUser || 'node';
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    logger_1.logger.info('Check environment...');
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, nodeUser);
    logger_1.logger.log('Eseguo listing directory backups');
    const backups = await deployScript.call(['-o', 'lsBackups'], false);
    console.log(backups);
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map