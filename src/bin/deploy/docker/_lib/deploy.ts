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
import { GenericObject, SshTarget, StringError } from '../../../../types';
import { parse } from 'yaml';
import { uploadAndInstallDeployScript } from '../../_lib/deployScript';
import inquirer from 'inquirer';
import { throwOnFatalError } from '../../_lib/fatalError';
import { checkProperties } from './checkProperties';

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

    let dockerComposeConfig: GenericObject = {};
    try{
        // Just check for file malformations. Stop deploy in this case!
        dockerComposeConfig = parse(readFileSync(dockerComposeFile).toString());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch(e:any){
        throw new StringError('File '+dockerComposeFileName+' malformato: '+e.message);
    }

    // Check file for properties correctness
    checkProperties(dockerComposeConfig);

    // ask the user which service to launch/rollout
    const answers = await inquirer.prompt([ {
        type: 'list',
        name: 'service',
        message: 'Service docker',
        choices: [{ name:'Tutti', value:'_all_' }, ...Object.keys(dockerComposeConfig.services ?? {}).map(v => ({ name:v, value:v }))]
    }]);

    let image = '';
    let allImages = false; // Bota sœ tot!
    if (answers.service === '_all_'){
        allImages = true;
        console.warn('ATTENZIONE: L\'update di tutte le app NON prevede zero downtime.');
    }else{
        image = dockerComposeConfig.services[answers.service].image;
        if (!image) throw new Error('Unknown image');
    }

    const appUser = target.nodeUser || 'onit';

    // connect to ssh remote target
    const session = await createSshSession(target);
    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, appUser);

    // path for filenames used during compose file upload
    const remoteTempDir = await session.getRemoteTmpDir(appUser);
    const remoteTempFile = remoteTempDir.trim() + dockerComposeFileName;
    const remoteDockerComposeFileName = `/home/${appUser}/apps/${dockerComposeFileName}`;
   
    logger.info('Upload ' + dockerComposeFileName);
    await session.uploadFile(dockerComposeFile, remoteTempFile);
    await session.command(`sudo cp ${remoteTempFile} ${remoteDockerComposeFileName}`);
    await session.command(`sudo chown ${appUser}:${appUser} ${remoteDockerComposeFileName}`);

    let deployParams = [];
    
    if (!allImages){
        // custom flag to trigger image validation via notation
        // Expected the server to already have a valid notation setup
        const verifyImage = dockerComposeConfig.services[answers.service]['x-verify-image'] ?? false;
        // Custom flag to enable zero downtime rollout
        const zeroDowntimeRollout = dockerComposeConfig.services[answers.service]['x-zero-downtime'] ?? false;
        
        if (zeroDowntimeRollout){
            // use the server-side node script to effectively perform the service rollout
            logger.info('Eseguo rollout');
            // rollout with zero downtime
            deployParams = [ '-o','docker-rollout'];
        }else{
            // update with downtime
            logger.info('Eseguo update');
            deployParams = [ '-o','docker-update'];
        }

        deployParams.push(...['-s',`"${answers.service}"`]);

        if (verifyImage) deployParams.push(...['--verify-image', image]);
    }else{
        // NOTE: Verification not implemented for full update
        // update with downtime
        logger.info('Eseguo update completo');
        deployParams = [ '-o','full-docker-update'];
    }
    
    const result = await deployScript.call(deployParams, true);
  
    // throw on deployScript call error
    throwOnFatalError(result.output);

    session.disconnect();

    return {
        complete: true
    };
}

