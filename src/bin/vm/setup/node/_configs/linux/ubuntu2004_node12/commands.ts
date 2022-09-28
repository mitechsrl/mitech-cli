import path from 'path';
import fs from 'fs';
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';
import { replaceNginxVars } from '../../../_lib/replaceNginxVars';
import { fileSync } from 'tmp-promise';

async function command(session: SshSession, answers: GenericObject){
    let tmpobj: GenericObject;

    logger.log('Update packages...');
    return session.command('sudo apt update')
        .then(() => {
            return session.command('sudo apt upgrade -y');
        })
        .then(() => {
            // istall dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
            logger.log('Installo dos2unix...'); 
            return session.command('sudo apt install dos2unix');
        })
        .then(() => {
            logger.log('Upload file configurazione nginx...');
            const nginxFilePath = path.join(__dirname, 'nginx-default.conf');
            const fileContent = replaceNginxVars(nginxFilePath, answers);
            // mi appoggio ad un file temporaneo, poi lo butto via
            tmpobj = fileSync();
            fs.writeSync(tmpobj.fd, fileContent);

            return session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
        })
        .then(() => {
            if (tmpobj) tmpobj.removeCallback();
            return session.command('dos2unix /tmp/nginx.conf');
        })
        .then(() => {
            logger.log('Upload setup.sh...');
            const setupSh = path.join(__dirname, 'setup.sh');
            return session.uploadFile(setupSh, '/tmp/setup.sh');
        })
        .then(() => session.command('dos2unix /tmp/setup.sh'))
        .then(() => session.command('sudo chmod +x /tmp/setup.sh'))
        .then(() => {
            logger.log('Avvio setup.sh...');
            return session.command('sudo /tmp/setup.sh ' + session.target.nodeUser);
        })
        .then(() => {
            logger.info('Setup completo!');
        });
}

export default command;