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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../../../../../lib/logger");
const uploadShFile_1 = require("../../../../../../../lib/uploadShFile");
const types_1 = require("../../../../../../../types");
async function command(session, answers) {
    // Prendo la lista di devices blocks dal server e chiedo all'utente quale usare.
    const result = await session.command('lsblk -J -o NAME,HCTL,SIZE,MOUNTPOINT', false);
    const json = JSON.parse(result.output.trim());
    logger_1.logger.log('');
    logger_1.logger.log('Blocchi trovati');
    const sdX = json.blockdevices.filter((blockDevice) => {
        // considera solo sdX
        const isSdX = blockDevice.name.startsWith('sd');
        // escludi i blocchi i cui figli sono montati come root (è disco or)
        const isOsDisk = JSON.stringify(blockDevice).indexOf('"mountpoint":"/"') >= 0;
        // escludi i dischi già formattati (quelli che hanno blocchi children, cioè le partizioni)
        const haveChilren = blockDevice.children && blockDevice.children.length > 0;
        // print some info
        if (isSdX) {
            logger_1.logger.log(`-- /dev/${blockDevice.name} (${blockDevice.size}) ---------------- ${isOsDisk ? 'disco-os' : ''} ${haveChilren ? 'gia-formattato' : ''}`);
            (blockDevice.children || []).forEach((element) => {
                logger_1.logger.log(` '--- /dev/${element.name} (${element.size})`);
            });
        }
        return isSdX && !isOsDisk && !haveChilren;
    });
    logger_1.logger.log('');
    if (sdX.length === 0) {
        throw new types_1.StringError('Impossibile trovare un disco valido vuoto da utilizzare. Nessuno dei blocchi rilevati sembra appartenere ad un disco non formatato');
    }
    // Chiedi all'utente il blocco da usare
    const blockDevices = [
        {
            name: 'blockdevice',
            type: 'list',
            message: 'Seleziona disco',
            choices: sdX.map((blockDevice) => ({ name: `/dev/${blockDevice.name} (${blockDevice.size})`, value: '/dev/' + blockDevice.name }))
        }
    ];
    const selectedSdX = await inquirer_1.default.prompt(blockDevices);
    logger_1.logger.log('Upload e avvio setup-disk.sh...');
    const setupResult = await (0, uploadShFile_1.uploadAndRunShFile)(session, path_1.default.join(__dirname, './setup-disk.sh'), '/tmp/setup-disk.sh', [selectedSdX.blockdevice, answers.mountpoint]);
    // check finale: lo script stampa AFTER=1 se trova il punto di mount. Verifico se c'è
    if (setupResult.output.indexOf('AFTER=1') >= 0) {
        logger_1.logger.info('Setup completo!');
    }
    else {
        logger_1.logger.error('Qualcosa è andato male... Il disco non è montato al termine della procedura');
    }
}
exports.default = command;
//# sourceMappingURL=commands.js.map