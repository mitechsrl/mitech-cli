import { Command } from '../../../types';

const config: Command = {
    description: 'Avvia client interattivo ssh',
    longHelp: 'Avvia client interattivo ssh. Su windows viene eseguito putty (incluso in questa utility), linux da implementare',
    exec: './exec',
    params: [
        {
            name:'target',
            config:{
                type: 'string',
                description: 'Nome target per autoselezione target'
            }
        }]
};

export default config;