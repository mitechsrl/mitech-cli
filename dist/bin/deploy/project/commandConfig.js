"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const commandConfig_1 = __importDefault(require("../app/commandConfig"));
const markdownPath = path_1.default.resolve(__dirname, '../../../../src/bin/deploy/project/README.md');
const config = {
    description: 'Utility deploy progetto multiserver',
    longHelp: `Esegue il deploy di un progetto su più VM con ambiente nodejs. 
    Per info, vedi:
    - https://github.com/mitechsrl/onit-next/issues/40
    - ${markdownPath}`,
    exec: './exec',
    params: [
        ...commandConfig_1.default.params,
        {
            name: 'f',
            config: {
                alias: 'force-dep',
                type: 'boolean',
                description: 'Forza il set delle dipendenze. Non applicare controlli.'
            },
        }
    ]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map