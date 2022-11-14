"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../../../../../types");
/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */
const config = {
    name: 'Ubuntu 20.04',
    value: {
        questions: [
            {
                type: 'mountpoint',
                name: 'mountpoint',
                message: 'Mount point (path assoluto)',
                default: '/datadrive'
            }
        ],
        validateAnswers: (answers) => {
            if (answers.mountpoint.indexOf('\\') >= 0)
                throw new types_1.StringError('Mount point invalido. Carattere \\ proibito');
            if (!answers.mountpoint.startsWith('/'))
                throw new types_1.StringError('Mount point invalido. Non è assoluto.');
        }
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map