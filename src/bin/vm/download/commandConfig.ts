import { Command } from '../../../types';

const config: Command = {
    description: 'Utility file download',
    exec: './exec',
    params: [{
        name: 's',
        config: {
            description: 'Source file, path globale file sorgente su dispositovo remoto da scaricare',
            type: 'string',
        }
    },
    {
        name: 'd',
        config: {
            description: 'Destination file, path dove scaricare il file sul dispositivo locale. Usa cwd se omesso',
            type: 'string'
        }
    }]
};

export default config;