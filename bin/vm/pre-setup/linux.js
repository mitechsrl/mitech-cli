const logger = require("../../../lib/logger");

module.exports = (session) => {
    logger.log('Verifico usabilità sudo...');
    return session.command('sudo ls; echo $?', false)
        .then(result => {
            if (result.trim().endsWith('1')) {
                let str = "Impossibile automatizzare gli script: il sistema remoto richiede l'inserimento della password a fronte di 'sudo'.\n";
                str = str + 'Puoi tentare di risolvere questo problema con i seguenti passi:\n';
                str = str + '- entra nel sistema remoto in ssh manualmente e digita <sudo visudo>\n';
                str = str + '- aggiungi la riga <' + session.target.username + '     ALL=(ALL) NOPASSWD:ALL> al termine del file\n';
                str = str + '- salva ed esci. (nota: visudo verifica il formato del file e avvisa in caso di errore)\n';
                str = str + 'Help: https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file';
                logger.error(str);
                logger.log('');
                return Promise.reject(new Error('Pre-setup checks failed'));
            } else {
                logger.info('Test passato');
            }
        });
};
