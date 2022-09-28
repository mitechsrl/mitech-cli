import yargs from 'yargs';
import { Command } from '../../types';

const config: Command = {
    description: 'Utility gestione crowdsec (cscli)',
    longHelp: `
    Proxy esecuzione comandi cscli su server remoto. "Mitech cscli <any command>" esegue "cscli <any command>" su server remoto',
    Vedi https://docs.crowdsec.net/docs/cscli/cscli/ per info.`,
    exec: './exec',
    params: [],
    strictCommands: false
};

export default config;