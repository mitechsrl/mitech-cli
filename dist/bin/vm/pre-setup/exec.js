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
const logger_1 = require("../../../lib/logger");
const ssh_1 = require("../../../lib/ssh");
const targets_1 = require("../../../lib/targets");
const types_1 = require("../../../types");
const linux_1 = require("./linux");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    if (!target)
        return;
    logger_1.logger.log('');
    logger_1.logger.info('Questo script eseguirà alcune verifiche al sistema remoto senza apportare alcuna modifica');
    logger_1.logger.log('');
    const session = await (0, ssh_1.createSshSession)(target);
    if (session.os.linux) {
        await (0, linux_1.linuxCmds)(session);
        logger_1.logger.log('');
        logger_1.logger.info('Tutti i test passati. Puoi procedere con il setup');
        session.disconnect();
    }
    else {
        session.disconnect();
        throw new types_1.StringError('Pre-setup script non disponibile per la piattaforma ' + JSON.stringify(session.os));
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map