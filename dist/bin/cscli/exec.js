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
const errorHandler_1 = require("../../lib/errorHandler");
const logger_1 = require("../../lib/logger");
const ssh_1 = require("../../lib/ssh");
const targets_1 = require("../../lib/targets");
const types_1 = require("../../types");
const exec = async (argv) => {
    const params = argv._.slice(1);
    if (params.length === 0) {
        logger_1.logger.warn('Nessun comando eseguito. Digita <mitech cscli -h>  per info');
        return;
    }
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    const session = await (0, ssh_1.createSshSession)(target);
    try {
        if (session.os.linux) {
            await session.command(['sudo', 'cscli', ...params], true);
        }
        else {
            throw new types_1.StringError('cscli non implementata per os su questa vm');
        }
    }
    catch (e) {
        (0, errorHandler_1.errorHandler)(e);
    }
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map