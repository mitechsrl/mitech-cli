"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Avvia client interattivo ssh',
    longHelp: 'Avvia client interattivo ssh. Su windows viene eseguito putty (incluso in questa utility), linux da implementare',
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