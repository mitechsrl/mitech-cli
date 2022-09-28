import yargs from 'yargs';
import { Command } from '../../../types';

const config: Command = {
    description: 'Utility gestione target remoti ssh',
    exec: './exec',
    params: []
};

export default config;