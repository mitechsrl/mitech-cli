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
import yargs from 'yargs';
import { logger } from '../../../../lib/logger';
import { createSshSession } from '../../../../lib/ssh';
import { getTarget, printTarget } from '../../../../lib/targets';
import { CommandExecFunction, GenericObject } from '../../../../types';
import { uploadAndInstallDeployScript } from '../../_lib/deployScript';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    const target = await getTarget();
    if (!target) return;
    printTarget(target);

    const nodeUser = target.nodeUser || 'node';

    // connect to ssh remote target
    const session = await createSshSession(target);

    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    const apps = JSON.parse((await deployScript.call(['-o', 'lsApps'])).output);

    const appSelection = await inquirer.prompt([
        {
            type: 'list',
            name: 'app',
            message: 'App da ripristinare',
            choices: apps
        }
    ]);

    const backups = JSON.parse((await deployScript.call(['-o', 'lsBackups', '-a', appSelection.app])).output);

    if (backups.length === 0) {
        console.error('Nessun backup da ripristinare per l\'app ' + appSelection.app);
    } else {
        const selection = await inquirer.prompt([
            {
                type: 'list',
                name: 'archive',
                message: 'Seleziona archivio da ripristinare.\nAttenzione! Nessuna assunzione viene fatta sull\'archivio, assicurarsi che sia quello corretto.',
                choices: backups.map((b: GenericObject) => ({
                    name: `${b.path} (${b.size})`,
                    value: b
                }))
            }
        ]);

        logger.warn('Ripristino ' + selection.archive.path + ' come app ' + appSelection.app);
        await deployScript.call(['-o', 'restoreBackup', '-a', selection.archive.path, '-p', appSelection.app], true);
    }
    session.disconnect();
};

export default exec;