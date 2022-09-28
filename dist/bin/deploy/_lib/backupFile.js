"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBackupFile = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../lib/logger");
async function downloadBackupFile(session, result) {
    // check if we have a backup file and download it
    const matchStr = '[BACKUP-FILE]:';
    let backupFileLine = result.split('\n').find(line => line.indexOf(matchStr) >= 0);
    if (backupFileLine) {
        backupFileLine = backupFileLine.substr(matchStr.length).trim();
        let file = backupFileLine.split(/[/\\]/g).pop();
        const filePath = path_1.default.join(process.cwd(), './deploy-backups/');
        (0, fs_1.mkdirSync)(filePath, { recursive: true });
        file = path_1.default.join(filePath, file);
        logger_1.logger.log('Download backup file: ' + file);
        await session.downloadFile(backupFileLine, file);
    }
    else {
        console.warn('Nessun file backup trovato');
    }
}
exports.downloadBackupFile = downloadBackupFile;
//# sourceMappingURL=backupFile.js.map