import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup disco aggiuntivo su VM',
    longHelp:'Questo comando formatta e monta un disco dati aggiuntivo su VM.\n'+
    'E\' necessario aver già connesso il disco aggiuntivo alla macchina virtuale.',
    exec: './exec',
    params: []
};

export default config;