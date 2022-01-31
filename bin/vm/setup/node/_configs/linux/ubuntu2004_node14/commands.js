const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const logger = require('../../../../../../../lib/logger');

module.exports = (session, answers) => {
    let tmpobj = null;

    logger.debug('Update packages...');
    // update e upgrade preventivo del sistema
    return session.command('sudo apt update')
        .then(() => {
            return session.command('sudo apt upgrade -y');
        })
        .then(() => {
            // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
            logger.debug('Installo dos2unix...');;
            return session.command('sudo apt install dos2unix');
        })
        .then(() => {
            // preprocesso il file di nginx per sostituire alcuni valori poi lo carico sul server.

            logger.debug('Upload file configurazione nginx...');
            const nginxFile = path.join(__dirname, 'nginx-default.conf');

            let file = fs.readFileSync(nginxFile).toString();
            Object.keys(answers).forEach(key => {
                file = file.replace(new RegExp('\\$' + key + '\\$', 'gm'), answers[key]);
            });

            // mi appoggio ad un file temporaneo, poi lo butto via
            tmpobj = tmp.fileSync();
            fs.writeSync(tmpobj.fd, file);

            return session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
        })
        .then(() => session.command('mkdir -p /etc/nginx'))
        .then(() => session.command('touch /etc/nginx/geo_dyn.conf'))
        .then(() => session.command('chmod 755 /etc/nginx/geo_dyn.conf'))
        .then(() => {
            if (tmpobj) tmpobj.removeCallback();
            return session.command('dos2unix /tmp/nginx.conf');
        })
        .then(() => {
            // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server
            logger.debug('Upload setup.sh...');
            const setupSh = path.join(__dirname, 'setup.sh');
            return session.uploadFile(setupSh, '/tmp/setup.sh');
        })
        .then(() => session.command('dos2unix /tmp/setup.sh'))
        // eseguo setup.sh sul server
        .then(() => session.command('sudo chmod +x /tmp/setup.sh'))
        .then(() => {
            logger.debug('Avvio setup.sh...');
            return session.command('sudo /tmp/setup.sh ' + session.target.nodeUser);
        })
        .then(() => {
            logger.info('Setup completo!');
        });
};
