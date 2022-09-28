import { Command } from '../../../types';

const config: Command = {
    description: 'Prepara e pubblica sul registry NPM Mitech la directory corente',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: [{
        name: 'y',
        config: {
            describe: 'Accetta automaticamente le richieste di conferma',
            type: 'boolean'
        }
    },
    {
        name: 'r',
        config: {
            describe: 'Usa per default il registry identificato da id',
            type: 'string'
        }
    }]
};

export default config;