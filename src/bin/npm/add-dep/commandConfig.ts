import yargs from 'yargs';
import { Command } from '../../../types';

const config: Command = {
    description: 'Utility manipolazione dipendenze npm in package.json',
    longHelp: 'Aggiunge o rimpiazza una dipendenza nel package.json specificato',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: [{
        name: 'p',
        config: {
            describe: 'Path al file package.json da eleborare',
            type: 'string'
        }
    },
    {
        name: 'd',
        config: {
            describe: 'Nome pacchetto npm da aggiungere/sostituire',
            type: 'string'
        }
    },
    {
        name: 'v',
        config: {
            describe: 'Versione del pacchetto da aggiungere/sostituire',
            type: 'string'
        }
    }]
};

export default config;