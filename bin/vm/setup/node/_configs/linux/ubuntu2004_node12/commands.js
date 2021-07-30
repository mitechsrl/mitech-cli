const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const logger = require('../../../../../../../lib/logger');

module.exports = (session, answers) => {
    let tmpobj = null;

    logger.debug('Update packages...');
    return session.command('sudo apt update')
        .then(() => {
            return session.command('sudo apt upgrade -y');
        })
        .then(() => {
            // istall dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
            logger.debug('Installo dos2unix...'); ;
            return session.command('sudo apt install dos2unix');
        })
        .then(() => {
            logger.debug('Upload file configurazione nginx...');
            const nginxFile = path.join(__dirname, 'nginx-default.conf');

            let file = fs.readFileSync(nginxFile).toString();
            Object.keys(answers).forEach(key => {
                file = file.replace(new RegExp('\\$' + key + '\\$', 'gm'), answers[key]);
            });

            tmpobj = tmp.fileSync();
            fs.writeSync(tmpobj.fd, file);

            return session.uploadFile(tmpobj.name, '/tmp/nginx.conf');
        })
        .then(() => {
            if (tmpobj) tmpobj.removeCallback();
            return session.command('dos2unix /tmp/nginx.conf');
        })
        .then(() => {
            logger.debug('Upload setup.sh...');
            const setupSh = path.join(__dirname, 'setup.sh');
            return session.uploadFile(setupSh, '/tmp/setup.sh');
        })
        .then(() => session.command('dos2unix /tmp/setup.sh'))
        .then(() => session.command('sudo chmod +x /tmp/setup.sh'))
        .then(() => {
            logger.debug('Avvio setup.sh...');
            return session.command('sudo /tmp/setup.sh ' + session.target.nodeUser);
        })
        .then(() => {
            logger.info('Setup completo!');
        });
};
