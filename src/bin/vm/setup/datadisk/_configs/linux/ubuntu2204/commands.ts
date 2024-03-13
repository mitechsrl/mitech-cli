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

import inquirer from 'inquirer';
import path from 'path';
import { logger } from '../../../../../../../lib/logger';
import { SshSession } from '../../../../../../../lib/ssh';
import { uploadAndRunShFile } from '../../../../../../../lib/uploadShFile';
import { GenericObject, StringError } from '../../../../../../../types';

async function command(session: SshSession, answers:GenericObject){
    
    // Prendo la lista di devices blocks dal server e chiedo all'utente quale usare.
    const result = await session.command('lsblk -J -o NAME,HCTL,SIZE,MOUNTPOINT', false);
    const json = JSON.parse(result.output.trim());
    logger.log('');
    logger.log('Blocchi trovati');

    // Il comando ha preso tutti i dispositivi, occorre filtrarli perchè tra di loro 
    // c'è anche il disco dell'OS.... che sarebbe meglio non formattare per sbaglio.
    const sdX = json.blockdevices.filter((blockDevice:GenericObject) => {
        // considera solo sdX
        const isSdX = blockDevice.name.startsWith('sd');
        // escludi i blocchi i cui figli sono montati come root (significa che è il disco OS)
        const isOsDisk = JSON.stringify(blockDevice).indexOf('"mountpoint":"/"')>=0;
        // escludi i dischi già formattati (quelli già montati e quelli che hanno già blocchi children, cioè le partizioni)
        const isFormatted = blockDevice.mountpoint || (blockDevice.children && blockDevice.children.length>0);
        // print some info
        if (isSdX){
            const tags = [
                isOsDisk?'Disco OS':'',
                isFormatted?'Già formattato':'Non formattato'
            ].filter(v => !!v).map(t => `[${t}]`).join(' ');

            logger.log(`--- /dev/${blockDevice.name}                 (${blockDevice.size}) ${tags}`);
            (blockDevice.children || []).forEach((element: GenericObject) => {
                logger.log(`  '--- /dev/${element.name} (${element.size})`);
            });
        }

        return isSdX && !isOsDisk && !isFormatted;        
    });

    logger.log('');
    if (sdX.length === 0){
        throw new StringError('Impossibile trovare un disco valido vuoto da utilizzare. Nessuno dei blocchi rilevati sembra appartenere ad un disco non formatato');
    }

    // Chiedi all'utente il blocco da usare
    // Questa lista è già filtrata e mostra solo i blocchi non formattati (cosi non rischiamo di disintegrare altri dischi in uso!)
    logger.log('Trovati '+sdX.length+' possibili dischi');

    const blockDevices = [
        {
            name:'blockdevice',
            type:'list',
            message:'Seleziona disco',
            choices: sdX.map((blockDevice: GenericObject) => ({ name: `/dev/${blockDevice.name} (${blockDevice.size})`, value: '/dev/'+blockDevice.name }))
        }
    ];
    const selectedSdX = await inquirer.prompt(blockDevices);

    logger.log('Upload e avvio setup-disk.sh...');
    const setupResult = await uploadAndRunShFile(
        session,
        path.join(__dirname, './setup-disk.sh'),
        '/tmp/setup-disk.sh',
        [selectedSdX.blockdevice, answers.mountpoint]);

    // check finale: lo script stampa AFTER=1 se trova il punto di mount. Verifico se c'è
    if (setupResult.output.indexOf('AFTER=1')>=0){
        logger.info('Setup completo!');
    }else{
        logger.error('Qualcosa è andato male... Il disco non è montato al termine della procedura. ATTENZIONE: Potrebbe essersi rotto qualcosa di serio. Verifica a manina!');
    }
}

export default command;
