"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility gestione backup deploy app',
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