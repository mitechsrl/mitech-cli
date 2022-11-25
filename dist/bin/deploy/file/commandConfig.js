"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility deploy Files su VM',
    longHelp: 'Esegue una copia di files su una VM remota.',
    exec: './exec',
    params: [{
            name: 's',
            config: {
                type: 'string',
                description: 'File o directory sorgente, rappresenta il file o il path da caricare'
            },
        },
        {
            name: 'd',
            config: {
                type: 'string',
                description: 'Directory remota in cui copiare i files. Per default parte dalla directory di deploy delle apps'
            },
        },
        {
            name: 'target',
            config: {
                type: 'string',
                description: 'Nome target per autoselezione target'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map