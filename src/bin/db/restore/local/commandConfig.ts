import { SUPPORTED_TYPES } from '../../../../lib/databaseSelector';
import { Command } from '../../../../types';

const config: Command = {
    description: 'Restore database in locale',
    longHelp: 'Esegue restore su db LOCALE di dump definiti nella directory corrente. Tipi di dump supportati: '+SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: []
};

export default config;