import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup mongodb su VM',
    longHelp: 'Installa mongodb (https://www.mongodb.com/it-it) sul target selezionato.',
    exec: './exec',
    params: []
};

export default config;