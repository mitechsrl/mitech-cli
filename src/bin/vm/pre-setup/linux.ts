import { logger } from '../../../lib/logger';
import { SshSession } from '../../../lib/ssh';
import { StringError } from '../../../types';

export async function linuxCmds(session: SshSession){
    logger.log('Verifico usabilità sudo...');
    const result = await session.command('sudo ls; echo $?', false);
    
    if (result.output.trim().endsWith('1')) {
        let str = 'Impossibile automatizzare gli script: il sistema remoto richiede l\'inserimento della password a fronte di \'sudo\'.\n';
        str = str + 'Puoi tentare di risolvere questo problema con i seguenti passi:\n';
        str = str + '- entra nel sistema remoto in ssh manualmente e digita <sudo visudo>\n';
        str = str + '- aggiungi la riga <' + session.target.username + '     ALL=(ALL) NOPASSWD:ALL> al termine del file (senza tag <>)\n';
        str = str + '- salva ed esci. (nota: visudo verifica il formato del file e avvisa in caso di errore)\n';
        str = str + 'Help: https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file';
        logger.error(str);
        logger.log('');
        throw new StringError('Pre-setup checks failed');
    }
    
    logger.info('Test passato');
       
}

