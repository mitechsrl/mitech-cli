"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../../../../../lib/logger");
const uploadShFile_1 = require("../../../../../../../lib/uploadShFile");
async function command(session, answers) {
    // update e upgrade preventivo del sistema
    logger_1.logger.log('Update packages...');
    await session.command('sudo apt update');
    await session.command('sudo apt upgrade -y');
    // install dos2unix per evitare problemi di '\r\n' su server quando si 
    // caricano i files .sh creati da windows
    logger_1.logger.log('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');
    // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server
    logger_1.logger.log('Upload e avvio setup.sh...');
    const setupSh = path_1.default.join(__dirname, 'setup.sh');
    await (0, uploadShFile_1.uploadAndRunShFile)(session, setupSh, '/tmp/setup.sh', [session.target.nodeUser, session.target.username]);
    logger_1.logger.info('Setup completo!');
}
exports.default = command;
//# sourceMappingURL=commands.js.map