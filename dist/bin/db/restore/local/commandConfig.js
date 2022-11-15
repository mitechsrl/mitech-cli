"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseSelector_1 = require("../../../../lib/databaseSelector");
const config = {
    description: 'Restore database in locale',
    longHelp: 'Esegue restore su db LOCALE di dump definiti nella directory corrente. Tipi di dump supportati: ' + databaseSelector_1.SUPPORTED_TYPES.join(', '),
    exec: './exec',
    params: []
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map