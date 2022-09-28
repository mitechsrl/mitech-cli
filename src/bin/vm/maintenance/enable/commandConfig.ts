import { Command } from '../../../../types';

const config: Command = {
    description: 'Abilita modalità maintenance.',
    longHelp:'Abilita la modalità maintenance. Il client che la abilita e quelli che utilizzano vpn mitech possono comunque accedere al sistema (controllo tramite ip)',
    exec: './exec',
    params: []
};

export default config;