"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Prepara e pubblica sul registry NPM Mitech la directory corente',
    exec: './exec',
    // https://yargs.js.org/docs/#api-reference-optionkey-opt
    params: [{
            name: 'y',
            config: {
                describe: 'Accetta automaticamente le richieste di conferma',
                type: 'boolean'
            }
        },
        {
            name: 'r',
            config: {
                describe: 'Usa per default il registry identificato da id',
                type: 'string'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map