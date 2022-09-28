"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility gestione crowdsec (cscli)',
    longHelp: `
    Proxy esecuzione comandi cscli su server remoto. "Mitech cscli <any command>" esegue "cscli <any command>" su server remoto',
    Vedi https://docs.crowdsec.net/docs/cscli/cscli/ per info.`,
    exec: './exec',
    params: [],
    strictCommands: false
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map