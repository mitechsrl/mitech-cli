import { mkdirSync } from 'fs';
import path from 'path';
import { logger } from '../../../lib/logger';
import { SshSession } from '../../../lib/ssh';

export async function downloadBackupFile (session: SshSession, result:string) {
    // check if we have a backup file and download it
    const matchStr = '[BACKUP-FILE]:';
    let backupFileLine = result.split('\n').find(line => line.indexOf(matchStr) >= 0);
    if (backupFileLine) {
        backupFileLine = backupFileLine.substr(matchStr.length).trim();
        let file = backupFileLine.split(/[/\\]/g).pop();
        const filePath = path.join(process.cwd(), './deploy-backups/');
        mkdirSync(filePath, { recursive: true });
        file = path.join(filePath, file!);
        logger.log('Download backup file: ' + file);
        await session.downloadFile(backupFileLine, file);
    } else {
        console.warn('Nessun file backup trovato');
    }
}
