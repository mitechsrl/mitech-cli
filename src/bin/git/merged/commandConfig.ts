import { Command } from '../../../types';

const config: Command = {
    description: 'Verifica merge branches',
    longHelp: 'Dato il nome di una branch, mostra lo stato di merge all\'interno della branch corrente',
    exec: './exec',
    params: [{
        name:'b',
        config: {
            description:'Nome branch da verificare. Opzionale, se non passata viene chiesta via prompt.'
        }
    }]
};

export default config;