import { SUPPORTED_TYPES } from '../../../../lib/databaseSelector';
import { Command } from '../../../../types';

const config: Command = {
    description: 'Restore database in locale',
    longHelp: 'Esegue restore su db LOCALE di dump definiti nella directory corrente. Tipi di dump supportati: '+SUPPORTED_TYPES.join(', '),
    exec: './exec',
    strictCommands: true,
    params: [{
        name:'drop',
        config:{
            type: 'boolean',
            description: 'Drop databases su target prima di eeguire restore'
        },
    }]
};

export default config;