"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility deploy ecosystem.config.json su VM',
    exec: './exec',
    params: [{
            name: 'r',
            config: {
                alias: 'restart',
                type: 'boolean',
                description: 'Ricarica pm2 al termine del deploy'
            },
        },
        {
            name: 'o',
            config: {
                alias: 'only',
                type: 'string',
                description: 'Ricarica solo l\'app specificata'
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