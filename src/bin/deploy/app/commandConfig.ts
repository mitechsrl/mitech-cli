import { Command } from '../../../types';
import { listUptimeChecks } from './_lib/listUptimeChecks';

const config: Command = {
    description: 'Utility deploy App su VM',
    longHelp:`Esegue un deploy su una VM con ambiente nodejs: carica il progetto locale, esegue npm install e pm2 restart.
    I files caricati possono essere controllati tramite il file .mitechcliignore, avente sintassi identica a .gitIgnore.
    Per default, vengono escluse le directory node_modules e .git`,
    exec: './exec',
    params: [{
        name:'d',
        config:{
            alias: 'download',
            type: 'boolean',
            description: 'Esegui il download del backup dell\'app remota'
        },
    },
    {
        name:'y',
        config:{
            alias:'yes',
            type: 'boolean',
            description: 'Risposta automatica <yes> su conferma deploy'
        },
    },
    {
        name:'c',
        config:{
            alias:'uptime-check',
            type: 'string',
            description: 'Esegue check di uptime app dopo deploy. Disponibili: ' + listUptimeChecks()
        },
    },
    {
        name:'target',
        config:{
            type: 'string',
            description: 'Nome target per autoselezione target'
        }
    }
    ]
};

export default config;