"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Elenca i tag che includono il merge di una branch',
    longHelp: 'Elenca i tag che includono il merge di una branch',
    exec: './exec',
    params: [{
            name: 'b',
            config: {
                description: 'Nome branch da verificare. Opzionale, se non passata viene chiesta via prompt.'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map