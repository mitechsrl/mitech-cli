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
const spawn_1 = require("../../../lib/spawn");
const exec = async () => {
    logger_1.logger.log('Autofetch...');
    // faccio fetch per avere info sulle commit in master
    await (0, spawn_1.spawn)('git', ['fetch'], false);
    const status = await (0, spawn_1.spawn)('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger_1.logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }
    const lastTag = await (0, spawn_1.spawn)('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode !== 0) || (!lastTag.output)) {
        logger_1.logger.error(':collision: Impossibile trovare un tag ');
        return;
    }
    const _count = await (0, spawn_1.spawn)('git', ['rev-list', '--count', lastTag.output.trim() + '..HEAD'], false);
    const count = parseInt(_count.output.trim());
    logger_1.logger.info('\nUltimo tag trovato: ' + lastTag.output.trim() + '\n');
    if (count === 0) {
        logger_1.logger.log('Non ci sono commit dal tag ' + lastTag.output.trim());
    }
    else {
        logger_1.logger.warn('Sono state trovate ' + count + ' commit dal tag ' + lastTag.output.trim() + '\n');
        const commitsFromTag = await (0, spawn_1.spawn)('git', ['log', lastTag.output.trim() + '..HEAD', '--pretty=format:"%h - %an - %s - %ad"'], false);
        logger_1.logger.log(commitsFromTag.output);
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map