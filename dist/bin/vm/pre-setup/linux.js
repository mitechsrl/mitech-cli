"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linuxCmds = void 0;
const logger_1 = require("../../../lib/logger");
const types_1 = require("../../../types");
async function linuxCmds(session) {
    logger_1.logger.log('Verifico usabilità sudo...');
    const result = await session.command('sudo ls; echo $?', false);
    if (result.output.trim().endsWith('1')) {
        let str = 'Impossibile automatizzare gli script: il sistema remoto richiede l\'inserimento della password a fronte di \'sudo\'.\n';
        str = str + 'Puoi tentare di risolvere questo problema con i seguenti passi:\n';
        str = str + '- entra nel sistema remoto in ssh manualmente\n';
        str = str + '- installa editor nano con comando "sudo apt-get install nano"\n';
        str = str + '- digita comando "sudo visudo"\n';
        str = str + '- aggiungi la riga <' + session.target.username + '     ALL=(ALL) NOPASSWD:ALL> al termine del file (senza tag <>)\n';
        str = str + '- salva ed esci. (nota: visudo verifica il formato del file e avvisa in caso di errore)\n';
        str = str + 'Help: https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file';
        logger_1.logger.error(str);
        logger_1.logger.log('');
        throw new types_1.StringError('Pre-setup checks failed');
    }
    logger_1.logger.info('Test passato');
}
exports.linuxCmds = linuxCmds;
//# sourceMappingURL=linux.js.map