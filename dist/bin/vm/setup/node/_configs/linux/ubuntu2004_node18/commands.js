"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../../../../lib/logger");
const replaceNginxVars_1 = require("../../../_lib/replaceNginxVars");
const tmp_promise_1 = require("tmp-promise");
const uploadShFile_1 = require("../../../../../../../lib/uploadShFile");
async function command(session, answers) {
    logger_1.logger.log('Update packages...');
    // update e upgrade preventivo del sistema
    await session.command('sudo apt update');
    await session.command('sudo apt upgrade -y');
    // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
    logger_1.logger.log('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');
    // preprocesso il file di nginx per sostituire alcuni valori poi lo carico sul server.
    logger_1.logger.log('Upload file configurazione nginx...');
    const nginxFilePath = path_1.default.join(__dirname, 'nginx-default.conf');
    const fileContent = (0, replaceNginxVars_1.replaceNginxVars)(nginxFilePath, answers);
    // mi appoggio ad un file temporaneo, poi lo butto via
    const tmpobj = (0, tmp_promise_1.fileSync)();
    fs_1.default.writeSync(tmpobj.fd, fileContent);
    // upload file su server
    await session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
    if (tmpobj)
        tmpobj.removeCallback();
    // dos2unix per eliminare newline windows
    await session.command('dos2unix /tmp/nginx.conf');
    // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server e lo eseguo
    logger_1.logger.log('Upload setup.sh...');
    await (0, uploadShFile_1.uploadAndRunShFile)(session, path_1.default.join(__dirname, 'setup.sh'), '/tmp/setup.sh', [session.target.nodeUser]);
    logger_1.logger.info('Setup completo!');
}
exports.default = command;
//# sourceMappingURL=commands.js.map