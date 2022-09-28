import yargs from 'yargs';
import { Command } from '../../types';

const config: Command = {
    description: 'Utility gestione pm2',
    exec: './exec',
    params: []
};

export default config;