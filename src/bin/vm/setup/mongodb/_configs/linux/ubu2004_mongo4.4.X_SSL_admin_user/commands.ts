import path from 'path';
import fs from 'fs';
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';

async function command(session: SshSession, answers: GenericObject){

    const jsFileContant = `
    use admin;
    db.createUser({
        user: "admin",
        pwd: "` + answers.adminPassword + `",
        roles: [ { role: "root", db: "admin" }, "readWriteAnyDatabase" ]
    })
    db.changeUserPassword('admin','` + answers.adminPassword + `')

    db.createUser({
        user: "` + answers.userUsername + `",
        pwd: "` + answers.userPassword + `",
        roles: [{ role: "readWriteAnyDatabase", db: "admin" }]
    });`;

    logger.log('Upload install_mongo.sh...');
    const setupSh = path.join(__dirname, 'install_mongo.sh');
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
            logger.log('Upload install_mongo.sh');
            return session.uploadFile(setupSh, '/tmp/install_mongo.sh');
        })
        .then(() => {
            logger.log('Upload mongodbUsers.js');
            fs.writeFileSync('mongodbUsers.js', jsFileContant);
            return session.uploadFile('mongodbUsers.js', '/tmp/mongodbUsers.js')
                .then(() => fs.unlinkSync('mongodbUsers.js'));
        })
        .then(() => session.command('dos2unix /tmp/install_mongo.sh'))
        .then(() => session.command('dos2unix /tmp/mongodbUsers.js'))
        .then(() => session.command('sudo chmod +x /tmp/install_mongo.sh'))
        .then(() => {
            logger.log('Avvio setup...');

            // escape for bash
            // const mongoPath = (answers.mongoPath || 'default').replace(/([^a-zA-Z0-9])/g, '\\' + '$1');
            // fix slashes
            const mongoPath = (answers.mongoPath || 'default').replace(/([\\/]+)/g, '/');
            return session.command('sudo /tmp/install_mongo.sh "' + mongoPath + '"');
        })
        .then(() => {
            logger.info('Setup completo!');
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => session.command('rm /tmp/install_mongo.sh'))
        .then(() => session.command('rm /tmp/mongodbUsers.js'));
}

export default command;
