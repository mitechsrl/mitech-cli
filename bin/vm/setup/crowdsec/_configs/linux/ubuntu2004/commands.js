const path = require('path');
const logger = require('../../../../../../../lib/logger');

module.exports = (session) => {
    logger.debug('Update packages...');
    // update e upgrade preventivo del sistema
    return session.command('sudo apt update')
        .then(() => {
            // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
            logger.debug('Installo dos2unix...');
            return session.command('sudo apt install dos2unix');
        })
        .then(() => {
            // carico il file setup-crowdsec.sh che contiene tutti i comandi bash da eseguire sul server
            logger.debug('Upload setup-crowdsec.sh...');
            const setupSh = path.join(__dirname, './setup-crowdsec.sh');
            return session.uploadFile(setupSh, '/tmp/setup-crowdsec.sh');
        })
        .then(() => session.command('dos2unix /tmp/setup-crowdsec.sh'))
        // eseguo setup.sh sul server
        .then(() => session.command('sudo chmod +x /tmp/setup-crowdsec.sh'))
        .then(() => {
            logger.debug('Avvio setup-crowdsec.sh...');
            return session.command('sudo /tmp/setup-crowdsec.sh');
        })
        .then(() => {
            logger.info('Setup completo!');
        });
};
