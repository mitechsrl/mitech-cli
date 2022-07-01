const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const logger = require('../../../../../../../lib/logger');
const { replaceNginxVars } = require('../../../_lib/replaceNginxVars');
const { uploadAndRunShFile } = require('../../../../../../../lib/uploadShFile');

module.exports = async (session, answers) => {
    let tmpobj = null;

    logger.debug('Update packages...');
    // update e upgrade preventivo del sistema
    await session.command('sudo apt update');
    await session.command('sudo apt upgrade -y');

    // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
    logger.debug('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');

    // preprocesso il file di nginx per sostituire alcuni valori poi lo carico sul server.
    logger.debug('Upload file configurazione nginx...');
    const nginxFilePath = path.join(__dirname, 'nginx-default.conf');
    const fileContent = replaceNginxVars(nginxFilePath, answers);
    // mi appoggio ad un file temporaneo, poi lo butto via
    tmpobj = tmp.fileSync();
    fs.writeSync(tmpobj.fd, fileContent);
    // upload file su server
    await session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
    if (tmpobj) tmpobj.removeCallback();
    // dos2unix per eliminare newline windows
    await session.command('dos2unix /tmp/nginx.conf');

    // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server e lo eseguo
    logger.debug('Upload setup.sh...');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, 'setup.sh'),
        '/tmp/setup.sh',
        [session.target.nodeUser]
    );

    logger.info('Setup completo!');
};
