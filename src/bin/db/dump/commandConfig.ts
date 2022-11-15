import { SUPPORTED_TYPES } from '../../../lib/databaseSelector';
import { Command } from '../../../types';

const config: Command = {
    description: 'Dump database',
    longHelp: 'Esegue dump di database definito nel file corrente .mitechcli. Tipi di dump supportati: '+SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: []
};

export default config;