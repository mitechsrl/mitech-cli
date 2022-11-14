"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../../../../lib/logger");
async function command(session, answers) {
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
    logger_1.logger.log('Upload install_mongo.sh...');
    const setupSh = path_1.default.join(__dirname, 'install_mongo.sh');
    return session.command('sudo apt update')
        .then(() => {
        return session.command('sudo apt upgrade -y');
    })
        .then(() => {
        // istall dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
        logger_1.logger.log('Installo dos2unix...');
        return session.command('sudo apt install dos2unix');
    })
        .then(() => {
        logger_1.logger.log('Upload install_mongo.sh');
        return session.uploadFile(setupSh, '/tmp/install_mongo.sh');
    })
        .then(() => {
        logger_1.logger.log('Upload mongodbUsers.js');
        fs_1.default.writeFileSync('mongodbUsers.js', jsFileContant);
        return session.uploadFile('mongodbUsers.js', '/tmp/mongodbUsers.js')
            .then(() => fs_1.default.unlinkSync('mongodbUsers.js'));
    })
        .then(() => session.command('dos2unix /tmp/install_mongo.sh'))
        .then(() => session.command('dos2unix /tmp/mongodbUsers.js'))
        .then(() => session.command('sudo chmod +x /tmp/install_mongo.sh'))
        .then(() => {
        logger_1.logger.log('Avvio setup...');
        // escape for bash
        // const mongoPath = (answers.mongoPath || 'default').replace(/([^a-zA-Z0-9])/g, '\\' + '$1');
        // fix slashes
        const mongoPath = (answers.mongoPath || 'default').replace(/([\\/]+)/g, '/');
        return session.command('sudo /tmp/install_mongo.sh "' + mongoPath + '"');
    })
        .then(() => {
        logger_1.logger.info('Setup completo!');
    })
        .catch(error => {
        logger_1.logger.error(error);
    })
        .then(() => session.command('rm /tmp/install_mongo.sh'))
        .then(() => session.command('rm /tmp/mongodbUsers.js'));
}
exports.default = command;
//# sourceMappingURL=commands.js.map