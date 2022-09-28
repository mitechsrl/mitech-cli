import yargs from 'yargs';
import { Command } from '../../../../types';

const config: Command = {
    description: 'Aggiunge target remoto per ssh',
    longHelp: 'Utility interattiva per creare un target ssh remoto',
    exec: './exec',
    params: []
};

export default config;