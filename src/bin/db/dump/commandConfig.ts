import { SUPPORTED_TYPES } from '../../../lib/databaseSelector';
import { Command } from '../../../types';

const config: Command = {
    description: 'Dump database',
    longHelp: 'Esegue dump di database definito nel file corrente .mitechcli. Tipi di dump supportati: '+SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: [/*{
        name:'zip',
        config:{
            type: 'boolean',
            description: 'Comprimi cartella destinazione dopo il dump'
        },
    },{
        name:'pwd',
        config:{
            type: 'boolean',
            description: 'Aggiungi password ad archivo zip. Valido solo se abbinato a --zip. La password viene chiesta a prompt'
        },
    }*/]
};

export default config;