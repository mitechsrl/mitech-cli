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
import { SshSession, createSshSession } from '../../../../lib/ssh';
import { GenericObject, SshTarget, StringError } from '../../../../types';
import { parse } from 'yaml';
import { uploadAndInstallDeployScript } from '../../_lib/deployScript';
import { validateComposeConfig } from './validateComposeConfig';

export type DeployResult = {
    aborted?: boolean,
    complete?: boolean
};

async function uploadDockerComposeFile(session: SshSession, appUser:string, localDockerComposeFilePath: string, dockerComposeFileName: string){
    
    logger.info('Upload ' + dockerComposeFileName);
    
    // Carico il file in una dir temporanea per questioni di permessi, poi lo
    // metto nella posizione definitiva e gli do i permessi giusti
    const remoteTempFile = path.posix.join(await session.tmp(), dockerComposeFileName);
    const remoteDockerComposeFileName = path.posix.join(await session.home(appUser),`/apps/${dockerComposeFileName}`);

    await session.uploadFile(localDockerComposeFilePath, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);
}

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

    let dockerComposeConfig: GenericObject = {};
    try{
        // Just check for file malformations. Stop deploy in this case!
        dockerComposeConfig = parse(readFileSync(dockerComposeFile).toString());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch(e:any){
        throw new StringError('File '+dockerComposeFileName+' malformato: '+e.message);
    }

    // Check file for properties correctness
    validateComposeConfig(dockerComposeConfig);

    const appUser = target.nodeUser || 'onit';

    // connect to ssh remote target
    const session = await createSshSession(target);
    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, appUser);
    // Upload the docker-compose file to server and place it in correct position
    await uploadDockerComposeFile(session, appUser, dockerComposeFile, dockerComposeFileName);
    
    // Call the deploy script on server to perform all the needed operations.
    // This run the docker swarm deploy using the docker-compose file uploaded before, which is expected to be in correct position
    const result = await deployScript.shellCall([ '-o','deploy-docker-swarm' ]);
  
    // throw on deployScript call error
    if (result.exitCode !== 0) {
        throw new StringError('Deploy fallito');
    }

    session.disconnect();

    return {
        complete: true
    };
}

