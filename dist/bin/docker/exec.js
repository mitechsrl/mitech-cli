"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../lib/logger");
const ssh_1 = require("../../lib/ssh");
const targets_1 = require("../../lib/targets");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    // rimuovi il primo pezzo (fino a "docker")
    const command = process.argv.slice(3);
    if (command.length === 0) {
        logger_1.logger.warn('Nessun comando eseguito. Digita <mitech docker -h>  per info');
        return;
    }
    const session = await (0, ssh_1.createSshSession)(target);
    const appUser = target.nodeUser || 'onit';
    await session.commandAs(appUser, ['sudo', 'docker', ...command]);
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map