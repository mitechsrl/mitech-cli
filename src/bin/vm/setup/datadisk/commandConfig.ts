import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup disco aggiuntivo su VM',
    longHelp:'Questo comando formatta e monta un disco dati aggiuntivo su VM.\n'+
    'E\' necessario aver già connesso il disco aggiuntivo alla macchina virtuale.\n'+
    'Automtizza questo documento: https://mitechsrlmn.sharepoint.com/:w:/s/Mitown/EUIADSbB9oZNj_-QGXfbyaUBxY9MBozrAUQMU3sT49d2Ew?e=zr8UxY',
    exec: './exec',
    params: []
};

export default config;