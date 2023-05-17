"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseSelector_1 = require("../../../lib/databaseSelector");
const config = {
    description: 'Dump database',
    longHelp: 'Esegue dump di database definito nel file corrente .mitechcli. Tipi di dump supportati: ' + databaseSelector_1.SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: [ /*{
        name:'zip',
        config:{
            type: 'boolean',
            description: 'Comprimi cartella destinazione dopo il dump'
        },
    },{
        name:'pwd',
        config:{
            type: 'boolean',
            description: 'Aggiungi password ad archivo zip. Valido solo se abbinato a --zip. La password viene chiesta a prompt'
        },
    }*/]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map