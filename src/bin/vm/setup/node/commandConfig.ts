import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup NodeJS su VM',
    longHelp: 'Installa NodeJS (https://nodejs.org/en/) sul target selezionato.',
    exec: './exec',
    params: []
};

export default config;