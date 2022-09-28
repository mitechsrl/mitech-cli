"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../lib/logger");
const ssh_1 = require("../../lib/ssh");
const targets_1 = require("../../lib/targets");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    // rimuovi il primo pezzo (pm2)
    const pm2Command = argv._.slice(1).map(p => p.toString());
    if (pm2Command.length === 0) {
        logger_1.logger.warn('Nessun comando eseguito. Digita <mitech pm2 -h>  per info');
        return;
    }
    const session = await (0, ssh_1.createSshSession)(target);
    const nodeUser = target.nodeUser || 'node';
    const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';
    await session.commandAs(nodeUser, [pm2, ...pm2Command]);
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map