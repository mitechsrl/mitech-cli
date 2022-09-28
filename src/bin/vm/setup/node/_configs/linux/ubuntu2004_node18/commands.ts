import path from 'path';
import fs from 'fs';
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';
import { replaceNginxVars } from '../../../_lib/replaceNginxVars';
import { fileSync } from 'tmp-promise';
import { uploadAndRunShFile } from '../../../../../../../lib/uploadShFile';

async function command(session: SshSession, answers: GenericObject){

    logger.log('Update packages...');
    // update e upgrade preventivo del sistema
    await session.command('sudo apt update');
    await session.command('sudo apt upgrade -y');

    // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
    logger.log('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');

    // preprocesso il file di nginx per sostituire alcuni valori poi lo carico sul server.
    logger.log('Upload file configurazione nginx...');
    const nginxFilePath = path.join(__dirname, 'nginx-default.conf');
    const fileContent = replaceNginxVars(nginxFilePath, answers);
    // mi appoggio ad un file temporaneo, poi lo butto via
    const tmpobj = fileSync();
    fs.writeSync(tmpobj.fd, fileContent);
    // upload file su server
    await session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
    if (tmpobj) tmpobj.removeCallback();
    // dos2unix per eliminare newline windows
    await session.command('dos2unix /tmp/nginx.conf');

    // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server e lo eseguo
    logger.log('Upload setup.sh...');
    await uploadAndRunShFile(
        session,
        path.join(__dirname, 'setup.sh'),
        '/tmp/setup.sh',
        [session.target.nodeUser]
    );

    logger.info('Setup completo!');
}

export default command;