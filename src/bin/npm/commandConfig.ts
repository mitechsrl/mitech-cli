import yargs from 'yargs';
import { Command } from '../../types';

const config: Command = {
    description: 'Utility gestione registry NPM Mitech',
    exec: './exec',
    params: []
};

export default config;