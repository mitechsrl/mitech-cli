import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup crowdsec VM',
    longHelp: 'Installa crowdsec (https://www.crowdsec.net/) sul target selezionato.',
    exec: './exec',
    params: []
};

export default config;