"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    name: 'Ubuntu 20.24',
    value: {
        questions: [
            {
                type: 'input',
                name: 'hostname',
                message: 'Hostname/dominio server (no http://, no porta, quello inserito in nginx \'server_name\')'
            },
            {
                type: 'input',
                name: 'email',
                message: 'Email per notifica scadenza certificato'
            }
        ]
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map