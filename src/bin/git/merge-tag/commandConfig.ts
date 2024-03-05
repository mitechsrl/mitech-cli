import { Command } from '../../../types';

const config: Command = {
    description: 'Elenca i tag che includono il merge di una branch',
    longHelp: 'Elenca i tag che includono il merge di una branch',
    exec: './exec',
    params: [{
        name:'b',
        config: {
            description:'Nome branch da verificare. Opzionale, se non passata viene chiesta via prompt.'
        }
    },
    {
        name:'',
        config: {
            alias: 'commits',
            description:'Mostra le commit successive a merge'
        }
    }
]
};

export default config;