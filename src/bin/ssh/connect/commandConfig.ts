import yargs from 'yargs';
import { Command } from '../../../types';

const config: Command = {
    description: 'Avvia client interattivo ssh',
    longHelp: 'Avvia client interattivo ssh. Su windows viene eseguito putty (incluso in questa utility), linux da implementare',
    exec: './exec',
    params: []
};

export default config;