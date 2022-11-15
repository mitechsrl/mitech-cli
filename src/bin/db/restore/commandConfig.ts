import { SUPPORTED_TYPES } from '../../../lib/databaseSelector';
import { Command } from '../../../types';

const config: Command = {
    description: 'Restore database',
    longHelp: 'Esegue restore di database definiti nella directory corrente. Tipi di dump supportati: '+SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: []
};

export default config;