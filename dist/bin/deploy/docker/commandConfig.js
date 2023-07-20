"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility deploy container Docker su VM',
    longHelp: 'Esegue caricamento file docker compose su una VM e ricarica la configurazione',
    exec: './exec',
    params: [
        {
            name: 'target',
            config: {
                type: 'string',
                description: 'Nome target per autoselezione target'
            }
        }
    ]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map