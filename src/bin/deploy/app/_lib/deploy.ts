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
import { uploadAndInstallDeployScript } from '../../_lib/deployScript';
import { createPackage } from './createPackage';
import { v4 as uuidv4 } from 'uuid';
import { throwOnDeployErrorError } from './deployError';
import { throwOnFatalError } from '../../_lib/fatalError';
import { downloadBackupFile } from '../../_lib/backupFile';
import { listUptimeChecks } from './listUptimeChecks';
import { confirm } from '../../../../lib/confirm';

/**
 * deploy the app at the proces.cwd() path to the remote target
 * Throws an error in case of fail
 *
 * @param {*} target ssh target
 * @param {*} params optional parameters object
 * @returns  A object, { aborted: bool, complete: bool}
 */

export async function deploy (target: SshTarget, params: yargs.ArgumentsCamelCase<unknown>) {
    const returnValue = {
        aborted: false,
        complete: false
    };

    const nodeUser = target.nodeUser || 'node';
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!existsSync(packageJsonPath)) {
        throw new Error('Nessun package.json trovato in questa directory');
    }

    // verify validity of uptimecheck
    const uptimeCheck = params.c as string;
    let uptimeCheckFn = null;
    if (uptimeCheck) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            uptimeCheckFn = require(path.join(__dirname, './uptimeChecks', uptimeCheck + '.js')).default;
        } catch (e) {
            const checks = listUptimeChecks();
            throw new StringError(`Unknown uptime check '${uptimeCheck}'. Available: ${checks}`);
        }
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    let packageName = packageJson.name;
    if (packageName.split('/').length > 1) { packageName = packageName.split('/')[1]; }

    if (! await confirm(params, packageJson.name + ' verrà deployato sul target selezionato. Continuare?')){
        returnValue.aborted = true;
        return returnValue;
    }

    // compress the cwd() folder
    const projectTar = await createPackage();

    // connect to ssh remote target
    const session = await createSshSession(target);

    // get destination paths from the remote target
    const remoteTempDir = await session.getRemoteTmpDir(nodeUser);
    const remoteTempFile = remoteTempDir.trim() + uuidv4() + '.tgz';

    // upload files
    logger.info('Upload: ' + packageName + '.tgz');
    await session.uploadFile(projectTar.path, remoteTempFile);
    await session.command(['sudo', 'chown', nodeUser + ':' + nodeUser, remoteTempFile]);

    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    // run the server deploy utility
    logger.info('Eseguo deploy app...');
    const result = await deployScript.call(['-o', 'deploy', '-p', packageName, '-a', '"' + remoteTempFile + '"'], true);

    // Do we need to download the entire app backup?
    // If yes, check if we have a backup file and download it
    const downloadBackup = params.d as boolean;
    if (downloadBackup) {
        downloadBackupFile(session, result.output);
    }

    // search and match the deploy error tag
    throwOnDeployErrorError(result.output);

    // search and match the generic fatal error tag error tag
    throwOnFatalError(result.output);

    if (uptimeCheck && uptimeCheckFn) {
        logger.log('Eseguo check uptime ' + uptimeCheck);
        await uptimeCheckFn(session, packageJson, result, target);
    }
    session.disconnect();

    returnValue.complete = true;
    return returnValue;
}

