import path from 'path';
import { Command } from '../../../types';
import deployAppConfig from '../app/commandConfig';

const markdownPath = path.resolve(__dirname, '../../../../src/bin/deploy/project/README.md');

const config: Command = {
    description: 'Utility deploy progetto multiserver',
    longHelp: `Esegue il deploy di un progetto su più VM con ambiente nodejs. 
    Per info, vedi:
    - https://github.com/mitechsrl/onit-next/issues/40
    - ${markdownPath}`,
    exec: './exec',
    params: [
        ...deployAppConfig.params,
        {
            name:'f',
            config:{
                alias: 'force-dep',
                type: 'boolean',
                description: 'Forza il set delle dipendenze. Non applicare controlli.'
            },
        }
    ]
};

export default config;