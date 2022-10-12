"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Verifica merge branches',
    longHelp: 'Dato il nome di una branch, mostra lo stato di merge all\'interno della branch corrente',
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