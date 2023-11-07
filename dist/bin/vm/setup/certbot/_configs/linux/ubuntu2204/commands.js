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
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../../../../../lib/logger");
const uploadShFile_1 = require("../../../../../../../lib/uploadShFile");
async function command(session, answers) {
    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    logger_1.logger.log('Upload e avvio setup-certbot.sh...');
    await (0, uploadShFile_1.uploadAndRunShFile)(session, path_1.default.join(__dirname, './setup-certbot.sh'), '/tmp/setup-certbot.sh', [answers.hostname, answers.email]);
    logger_1.logger.info('Setup completo!');
}
exports.default = command;
//# sourceMappingURL=commands.js.map