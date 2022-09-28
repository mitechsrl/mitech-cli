import { Command } from '../../../../types';

const config: Command = {
    description: 'Aggiunge configurazione registry npm',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: []
};

export default config;