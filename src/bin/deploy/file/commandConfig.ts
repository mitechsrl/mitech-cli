import { Command } from '../../../types';

const config: Command = {
    description: 'Utility deploy Files su VM',
    longHelp:'Esegue una copia di files su una VM remota.',
    exec: './exec',
    params: [{
        name:'s',
        config:{
            type: 'string',
            description: 'File o directory sorgente, rappresenta il file o il path da caricare'
        },
    },
    {
        name:'d',
        config:{
            type: 'string',
            description: 'Directory remota in cui copiare i files. Per default parte dalla directory di deploy delle apps'
        },
    }]
};

export default config;