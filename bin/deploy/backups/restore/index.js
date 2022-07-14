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

const targets = require('../../../../lib/targets');
const ssh = require('../../../../lib/ssh');
const logger = require('../../../../lib/logger');
const { uploadAndInstallDeployScript } = require('../../_lib/deployScript');
const inquirer = require('inquirer');

module.exports.info = [
    'Utility restore deploy backup'
];
module.exports.help = [

];

module.exports.cmd = async function (basepath, params) {
    const projectName = params.get('-p');

    const target = await targets.get();
    targets.print(target);
    if (!target) return;

    const nodeUser = target.nodeUser || 'node';

    // connect to ssh remote target
    const session = await ssh.createSshSession(target);

    // upload script deploy
    const deployScript = await uploadAndInstallDeployScript(session, nodeUser);

    const apps = JSON.parse(await deployScript.call(['-o', 'lsApps']));

    const appSelection = await inquirer.prompt([
        {
            type: 'list',
            name: 'app',
            message: 'App da ripristinare',
            choices: apps
        }
    ]);

    const backups = JSON.parse(await deployScript.call(['-o', 'lsBackups', '-a', appSelection.app]));

    if (backups.length === 0) {
        console.error("Nessun backup da ripristinare per l'app " + appSelection.app);
    } else {
        const selection = await inquirer.prompt([
            {
                type: 'list',
                name: 'archive',
                message: 'Seleziona archivio da ripristinare. Attenzione. Nessuna assunzione viene fatta sull\'archivio, assicurarsi che sia quello corretto.',
                choices: backups.map(b => b.path)
            }
        ]);

        logger.warn('Ripristino ' + selection.archive + ' come app ' + projectName.value);
        await deployScript.call(['-o', 'restoreBackup', '-a', selection.archive, '-p', appSelection.app], true);
    }
    session.disconnect();
};
