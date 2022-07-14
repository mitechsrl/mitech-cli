const path = require('path');
const fs = require('fs');
const logger = require('../../../lib/logger');

module.exports.downloadBackupFile = async (session, result) => {
    // check if we have a backup file and download it
    const matchStr = '[BACKUP-FILE]:';
    let backupFileLine = result.split('\n').find(line => line.indexOf(matchStr) >= 0);
    if (backupFileLine) {
        backupFileLine = backupFileLine.substr(matchStr.length).trim();
        let file = backupFileLine.split(/[\/\\]/g).pop();
        const filePath = path.join(process.cwd(), './deploy-backups/');
        fs.mkdirSync(filePath, { recursive: true });
        file = path.join(filePath, file);
        logger.log('Download backup file: ' + file);
        await session.downloadFile(backupFileLine, file);
    } else {
        console.warn('Nessun file backup trovato');
    }
};
