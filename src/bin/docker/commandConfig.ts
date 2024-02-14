import { Command } from '../../types';

const config: Command = {
    description: 'Utility CLI docker su server remoto.',
    longHelp: 'Esegue in proxy un qualsiasi comando docker su target remoto.\nAppendi a <mitech docker> un qualsiasi comando valido docker, ad esempio <mitech docker ps> per vedere la lista dei processi.\nVedi https://docs.docker.com/engine/reference/commandline/cli/ per info comandi ',
    exec: './exec',
    params: [],
    strictCommands: false,
    strictOptions: false
};

export default config;