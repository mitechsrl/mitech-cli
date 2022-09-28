import { Command } from '../../../types';

const config: Command = {
    description: 'Genera file di autorizzazone npm',
    longHelp: 'Crea nella directory corrente un file .npmrc che permette l\'accesso al registry NPM Mitech in fase di install',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: []
};

export default config;