const path = require('path');
const logger = require('../../../../../../../lib/logger');
const { uploadShfile } = require('../../../../../../../lib/uploadShFile');

module.exports = async (session, answers) => {
    logger.debug('Update packages...');
    // update e upgrade preventivo del sistema
    await session.command('sudo apt update');

    // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
    logger.debug('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');

    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    logger.debug('Upload setup-redis.sh...');

    await uploadShfile(
        session,
        path.join(__dirname, './setup-redis.sh'),
        '/tmp/setup-redis.sh');

    logger.debug('Avvio setup-redis.sh...');
    await session.command('sudo /tmp/setup-redis.sh ' + answers.password);

    logger.info('Setup completo!');
};
