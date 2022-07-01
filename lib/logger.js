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

const colors = require('colors');
const emoji = require('node-emoji');


/**
 * Utility di log a console.
 * Passando stringhe, si possono usare gli emoji (non tutte le cli li supportano)
 * Vedi https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
 */
module.exports = {
    rawLog: message => process.stdout.write(message),
    log: message => {
        if (typeof message === 'string') {
            console.log(emoji.emojify(message));
        } else {
            console.log(message);
        }
    },
    error: message => {
        if (typeof message === 'string') {
            console.log(colors.red(emoji.emojify(message)));
        } else {
            console.log(message);
        }
    },

    warn: message => {
        if (typeof message === 'string') {
            console.log(colors.yellow(emoji.emojify(message)));
        } else {
            console.log(message);
        }
    },
    info: message => {
        if (typeof message === 'string') {
            console.log(colors.green(emoji.emojify(message)));
        } else {
            console.log(message);
        }
    },
    debug: message => {
        if (typeof message === 'string') {
            console.log(colors.blue(emoji.emojify(message)));
        } else {
            console.log(message);
        }
    }
};
