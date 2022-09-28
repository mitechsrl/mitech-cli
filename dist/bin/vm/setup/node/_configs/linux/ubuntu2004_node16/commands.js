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
async function command(session, answers) {
    let tmpobj;
    logger_1.logger.log('Update packages...');
    // update e upgrade preventivo del sistema
    return session.command('sudo apt update')
        .then(() => {
        return session.command('sudo apt upgrade -y');
    })
        .then(() => {
        // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
        logger_1.logger.log('Installo dos2unix...');
        return session.command('sudo apt install dos2unix');
    })
        .then(() => {
        // preprocesso il file di nginx per sostituire alcuni valori poi lo carico sul server.
        logger_1.logger.log('Upload file configurazione nginx...');
        const nginxFilePath = path_1.default.join(__dirname, 'nginx-default.conf');
        const fileContent = (0, replaceNginxVars_1.replaceNginxVars)(nginxFilePath, answers);
        // mi appoggio ad un file temporaneo, poi lo butto via
        tmpobj = (0, tmp_promise_1.fileSync)();
        fs_1.default.writeSync(tmpobj.fd, fileContent);
        return session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
    })
        .then(() => {
        if (tmpobj)
            tmpobj.removeCallback();
        return session.command('dos2unix /tmp/nginx.conf');
    })
        .then(() => {
        // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server
        logger_1.logger.log('Upload setup.sh...');
        const setupSh = path_1.default.join(__dirname, 'setup.sh');
        return session.uploadFile(setupSh, '/tmp/setup.sh');
    })
        .then(() => session.command('dos2unix /tmp/setup.sh'))
        // eseguo setup.sh sul server
        .then(() => session.command('sudo chmod +x /tmp/setup.sh'))
        .then(() => {
        logger_1.logger.log('Avvio setup.sh...');
        return session.command('sudo /tmp/setup.sh ' + session.target.nodeUser);
    })
        .then(() => {
        logger_1.logger.info('Setup completo!');
    });
}
exports.default = command;
//# sourceMappingURL=commands.js.map