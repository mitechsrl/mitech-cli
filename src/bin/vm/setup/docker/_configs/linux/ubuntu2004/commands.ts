import path from 'path';
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';
import { uploadAndRunShFile } from '../../../../../../../lib/uploadShFile';

async function command(session: SshSession, answers: GenericObject){

    // update e upgrade preventivo del sistema
    logger.log('Update packages...');
    await session.command('sudo apt update');
    await session.command('sudo apt upgrade -y');

    // install dos2unix per evitare problemi di '\r\n' su server quando si 
    // caricano i files .sh creati da windows
    logger.log('Installo dos2unix...');
    await session.command('sudo apt install dos2unix');
    
    // carico il file setup.sh che contiene tutti i comandi bash da eseguire sul server
    logger.log('Upload e avvio setup.sh...');
    const setupSh = path.join(__dirname, 'setup.sh');
    await uploadAndRunShFile(session, setupSh,'/tmp/setup.sh',[session.target.nodeUser, session.target.username]);
    logger.info('Setup completo!');
}

export default command;