"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Utility manipolazione dipendenze npm in package.json',
    longHelp: 'Aggiunge o rimpiazza una dipendenza nel package.json specificato',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: [{
            name: 'p',
            config: {
                describe: 'Path al file package.json da eleborare',
                type: 'string'
            }
        },
        {
            name: 'd',
            config: {
                describe: 'Nome pacchetto npm da aggiungere/sostituire',
                type: 'string'
            }
        },
        {
            name: 'v',
            config: {
                describe: 'Versione del pacchetto da aggiungere/sostituire',
                type: 'string'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map