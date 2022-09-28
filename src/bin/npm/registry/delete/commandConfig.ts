import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility rimozione registry NPM',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: []
};

export default config;