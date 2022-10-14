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
    name: 'Ubuntu 22.04, Node 16.X, Nginx, pm2 5.1.2',
    value: {
        questions: [{
            type: 'input',
            name: 'MITECH_HOSTNAME',
            message: 'FQDN hostname (solo ip/dns senza http(s)://)'
        }]
    }
};

export default config;