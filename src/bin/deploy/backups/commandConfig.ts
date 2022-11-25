import { Command } from '../../../types';

const config: Command = {
    description: 'Utility gestione backup deploy app',
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