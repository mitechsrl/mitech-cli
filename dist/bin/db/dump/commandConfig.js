"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseSelector_1 = require("../../../lib/databaseSelector");
const config = {
    description: 'Dump database',
    longHelp: 'Esegue dump di database definito nel file corrente .mitechcli. Tipi di dump supportati: ' + databaseSelector_1.SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: []
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map