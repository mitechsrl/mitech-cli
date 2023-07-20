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

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import yargs from 'yargs';
import { logger } from '../../../../lib/logger';
import { createSshSession } from '../../../../lib/ssh';
import { SshTarget, StringError } from '../../../../types';
import { parse } from 'yaml';

export type DeployResult = {
    aborted?: boolean,
    complete?: boolean
};
/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */

export async function deploy (target: SshTarget, params: yargs.ArgumentsCamelCase<unknown>): Promise<DeployResult>{

    const dockerComposeFileName='docker-compose.yml'; 
    const dockerComposeFile = path.join(process.cwd(), dockerComposeFileName);

    if (!existsSync(dockerComposeFile)) {
        throw new StringError('Nessun file '+dockerComposeFileName+' trovato in questa directory.');
    }

    try{
        // Just check for file malformations. Stop deploy in this case!
        const dcf = readFileSync(dockerComposeFile).toString();
        parse(dcf);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch(e:any){
        throw new StringError('File '+dockerComposeFileName+' malformato: '+e.message);
    }

    const appUser = target.nodeUser || 'onit';

    // connect to ssh remote target
    const session = await createSshSession(target);

    // tmp filenames for upload
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteTempFile = remoteTempDir.trim() + dockerComposeFileName;

    // Final compose file position
    const remoteDockerComposeFileName = `/home/${appUser}/apps/${dockerComposeFileName}`;
    
    // upload files
    logger.info('Upload ' + dockerComposeFileName);
    
    await session.uploadFile(dockerComposeFile, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);

    // Reload docker compose
    await session.command(`cd /home/${appUser}/apps/; sudo /usr/bin/docker compose up -d --remove-orphans`);

    session.disconnect();

    return {
        complete: true
    };
}

