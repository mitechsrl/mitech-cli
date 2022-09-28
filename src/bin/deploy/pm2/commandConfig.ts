import { Command } from '../../../types';

const config: Command = {
    description: 'Utility deploy ecosystem.config.json su VM',
    exec: './exec',
    params: [{
        name:'r',
        config:{
            alias: 'restart',
            type: 'boolean',
            description: 'Ricarica pm2 al termine del deploy'
        },
    },
    {
        name:'o',
        config:{
            alias:'only',
            type: 'string',
            description: 'Ricarica solo l\'app specificata'
        },
    }]
};

export default config;