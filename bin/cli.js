#!/usr/bin/env node
/* eslint-disable node/shebang */

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

const logger = require('../lib/logger');
const command = require('../lib/command');
const header = require('../lib/header');
const verbose = require('../lib/verbose');

// mostra versione globale CLI
if (process.argv.length === 3 && process.argv[2] === '-v') {
    header();
} else {
    (async () => {
        try {
            await command.command(__dirname, process.argv.slice(2));
        } catch (e) {
            logger.error(e.message);
            if (verbose) {
                logger.log(e);
                logger.log('Stack trace:');
                logger.log(e.stack);
            }
        }
    })();
}
