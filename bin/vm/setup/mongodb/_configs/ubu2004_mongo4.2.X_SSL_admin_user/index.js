const path = require('path');

const fs = require('fs');
const logger = require('../../../../../../lib/logger');

module.exports = (session, answers) => {
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
        roles: [{ role: "readWrite", db: "` + answers.userUsername + `" }]
    });`;

    logger.debug('Upload install_mongo.sh...');
    const setupSh = path.join(__dirname, 'install_mongo.sh');
    return session.command('sudo apt update')
        .then(() => {
            return session.command('sudo apt upgrade -y');
        })
        .then(() => {
            // istall dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
            logger.debug('Installo dos2unix...');
            return session.command('sudo apt install dos2unix');
        })
        .then(() => {
            logger.debug('Upload install_mongo.sh');
            return session.uploadFile(setupSh, '/tmp/install_mongo.sh');
        })
        .then(() => {
            logger.debug('Upload mongodbUsers.js');
            fs.writeFileSync('mongodbUsers.js', jsFileContant);
            return session.uploadFile('mongodbUsers.js', '/tmp/mongodbUsers.js')
                .then(() => fs.unlinkSync('mongodbUsers.js'));
        })
        .then(() => session.command('dos2unix /tmp/install_mongo.sh'))
        .then(() => session.command('dos2unix /tmp/mongodbUsers.js'))
        .then(() => session.command('sudo chmod +x /tmp/install_mongo.sh'))
        .then(() => {
            logger.debug('Avvio setup...');
            return session.command('sudo /tmp/install_mongo.sh');
        })
        .then(() => {
            logger.info('Setup completo!');
        })
        .catch(error => {
            logger.error(error);
        })
        .then(() => session.command('rm /tmp/install_mongo.sh'))
        .then(() => session.command('rm /tmp/mongodbUsers.js'));
};
