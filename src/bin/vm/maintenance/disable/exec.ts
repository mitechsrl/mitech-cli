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

import { createSshSession } from '../../../../lib/ssh';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction } from '../../../../types';
import fs from 'fs';
import fetch from 'node-fetch';
import { file } from 'tmp-promise';
import { validateIPaddress } from '../_lib/validateIpAddress';
import { logger } from '../../../../lib/logger';
import yargs from 'yargs';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const t = await getTarget();
    printTarget(t);

    const session = await createSshSession(t);

    const response = await fetch('https://api.ipify.org');
    const ip = (await response.text()).trim();

    if (!validateIPaddress(ip)) {
        console.warn('Impossibile rimuovere l\'indirizzo ip locale da /etc/nginx/geo_dyn.conf');
    } else {
        console.warn('Rimuovo ip locale ' + ip + ' da /etc/nginx/geo_dyn.conf');
        const tmpFile = await file({ discardDescriptor: true, postfix: '.conf' });
        await session.downloadFile('/etc/nginx/geo_dyn.conf', tmpFile.path);
        const fileContent = (await fs.promises.readFile(tmpFile.path)).toString();
        let fileContentLines = fileContent.split('\n');
        fileContentLines = fileContentLines.filter(l => l.indexOf(ip) < 0);
        await fs.promises.writeFile(tmpFile.path, fileContentLines.join('\n'));
        await session.uploadFile(tmpFile.path, '/tmp/geo_dyn.conf');
        await session.command('sudo mv /tmp/geo_dyn.conf /etc/nginx/geo_dyn.conf');
        tmpFile.cleanup();
        await session.command('sudo systemctl reload nginx.service');
    }

    // set the nginx config
    logger.log('Rimuovo file lock di maintenance mode...');
    await session.command('sudo rm -rf /var/www/maintmode');

    logger.success('Modalità maintenance disattivata');

    session.disconnect();
};

export default exec;