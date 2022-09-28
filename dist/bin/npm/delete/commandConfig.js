"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Rimuove un pacchetto dal registry NPM Mitech',
    longHelp: `Rimuove un pacchetto dal registry NPM Mitech.
    Per l'accesso è necessario avere un file npmrc di autorizzazione. Esegui <mitech npm authorize> per crearne uno.

    Esempio:
      Q: Rimuove dal registry mitech il pacchetto packageName
      A: mitech npm delete -p packageName `,
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: [{
            name: 'p',
            config: {
                describe: 'Nome pacchetto da rimuovere',
                type: 'string'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map