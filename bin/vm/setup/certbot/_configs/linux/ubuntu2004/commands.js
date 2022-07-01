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

const path = require('path');
const logger = require('../../../../../../../lib/logger');
const { uploadAndRunShFile } = require('../../../../../../../lib/uploadShFile');

module.exports = async (session, answers) => {
    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    logger.debug('Upload e avvio setup-certbot.sh...');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, './setup-certbot.sh'),
        '/tmp/setup-certbot.sh',
        [answers.hostname, answers.email]);

    logger.info('Setup completo!');
};
