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

const targets = require('../../../lib/targets');
const path = require('path');
const ssh = require('../../../lib/ssh');
const fs = require('fs');
const logger = require('../../../lib/logger');

module.exports.info = [
    'Utility fle download'
];
module.exports.help = [
    ['-s', 'Source file, path globale file sorgente su dispositovo remoto da scaricare'],
    ['-d', 'Destination file, path dove scaricare il file sul dispositivo locale. Usa cwd se omesso']
];

module.exports.cmd = async function (basepath, params) {
    const remoteFile = params.get('-s');
    const destinationfile = params.get('-d');
    if (!remoteFile.found) {
        logger.error('Nessun file specificato. Usa -s per specificare il path del file sul sistema remoto');
    } else {
        const target = await targets.get();
        targets.print(target);
        if (!target) return;

        // connect to ssh remote target
        const session = await ssh.createSshSession(target);
        let fileName = path.basename(remoteFile.value);
        if (destinationfile.found) {
            fileName = path.join(destinationfile.value, fileName);
        }
        logger.log('Scarico ' + remoteFile.value);

        const start = new Date();
        await session.downloadFile(remoteFile.value, fileName);
        const end = new Date();

        const stats = fs.statSync(fileName);
        logger.log('Download completato, ' + (stats.size / (1024 * 1024)).toFixed(2) + ' Mb in ' + ((end - start) / 1000).toFixed(0) + ' sec');
        logger.log('File destinazione: ' + fileName);
        session.disconnect();
    }
};
