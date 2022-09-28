import { Command } from '../../../types';

const config: Command = {
    description: 'Verifica up-to-date build',
    longHelp: 'Verifica se sono state eseguite commit dall\'ultimo tag di versione. Se ve ne sono, allora sono state apportate modifiche dopo l\'ultima build',
    exec: './exec',
    params: []
};

export default config;