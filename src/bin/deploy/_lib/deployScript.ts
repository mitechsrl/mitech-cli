import { SshSession } from '../../../lib/ssh';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../lib/logger';
import { appsContainer } from './appsContainer';

/**
 * Upload the deploy script and return a helper object to call it.
 *
 * @param {*} session ssh session
 * @param {*} nodeUser User for which script must be run
 * @returns
 *  {call: async ([params], print) => Promise<string>}
 *  call: A proxy function to call the deploy script with the provided parameters.
 *        To know the parameters, see ./_instructions/deploy_instructions.js (at the end of file)
 */
export async function uploadAndInstallDeployScript(session:SshSession, nodeUser:string){

    logger.info('Upload e preparazione deploy script...');

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteDeployBasePath = await session.getRemoteHomeDir(nodeUser, '.' + appsContainer);
    const remoteDeployInstructionsFile = remoteDeployBasePath + 'deploy-instructions.js';

    let files = await fs.promises.readdir(path.join(__dirname, '../_instructions')); 
    files = files.filter(f => {
        const skipExtensions = ['.md','.d.ts','.map'];
        return !skipExtensions.find(ext => f.toLowerCase().endsWith(ext));
    });  
   
    // on linux upload will store the files into tmp then copy them in their final position with the appropriate user.
    // this is to avoid permission problems between the uploading user and the target directory user.
    for (const file of files) {
        const _f = remoteTempDir.trim() + file;
        await session.uploadFile(path.join(__dirname, '../_instructions/', file), _f);
        await session.commandAs(nodeUser, `cp ${_f} ${remoteDeployBasePath + file}`);
        await session.command(['rm', _f]);
    }

    console.log('installo dipendenze script deploy...');
    // install the dependencies for the deploy script
    // FIXME: Da node 17, si preferisce ipv6.
    // Se il server però ha lo stack non abilitato ipv6, npm non va maremma ladrona!
    // Setto un flag che fa preferire ipv4
    await session.commandAs(nodeUser, `cd ${remoteDeployBasePath}; export NODE_OPTIONS=--dns-result-order=ipv4first; npm install`, true);
    
    return {
        // Run the remote deploy script
        // @param {*} args un script parameters
        // @param {*} print Print command output. False by default
        // @returns A promise
        call: async (args: string[], print = false) => {
            const parts = ['node', remoteDeployInstructionsFile, ...args];
            return session.commandAs(nodeUser, parts, print);
        }
    };
}
