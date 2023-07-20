import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup Docker su VM',
    longHelp: 'Installa Docker e dipendnenze su VM remota.',
    exec: './exec',
    params: []
};

export default config;