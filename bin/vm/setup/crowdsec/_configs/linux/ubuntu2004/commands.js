const path = require('path');
const logger = require('../../../../../../../lib/logger');
const { uploadAndRunShFile } = require('../../../../../../../lib/uploadShFile');

module.exports = async (session) => {
    // carico il file setup-crowdsec.sh che contiene tutti i comandi bash da eseguire sul server
    logger.debug('Upload e avvio setup-crowdsec.sh...');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, './setup-crowdsec.sh'),
        '/tmp/setup-crowdsec.sh'
    );

    logger.info('Setup completo!');
};
