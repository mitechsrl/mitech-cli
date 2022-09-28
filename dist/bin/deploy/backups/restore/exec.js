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
const logger_1 = require("../../../../lib/logger");
const ssh_1 = require("../../../../lib/ssh");
const targets_1 = require("../../../../lib/targets");
const deployScript_1 = require("../../_lib/deployScript");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    if (!target)
        return;
    (0, targets_1.printTarget)(target);
    const nodeUser = target.nodeUser || 'node';
    // connect to ssh remote target
    const session = await (0, ssh_1.createSshSession)(target);
    // upload script deploy
    const deployScript = await (0, deployScript_1.uploadAndInstallDeployScript)(session, nodeUser);
    const apps = JSON.parse((await deployScript.call(['-o', 'lsApps'])).output);
    const appSelection = await inquirer_1.default.prompt([
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
    }
    else {
        const selection = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'archive',
                message: 'Seleziona archivio da ripristinare. Attenzione. Nessuna assunzione viene fatta sull\'archivio, assicurarsi che sia quello corretto.',
                choices: backups.map((b) => b.path)
            }
        ]);
        logger_1.logger.warn('Ripristino ' + selection.archive + ' come app ' + appSelection.app);
        await deployScript.call(['-o', 'restoreBackup', '-a', selection.archive, '-p', appSelection.app], true);
    }
    session.disconnect();
};
exports.default = exec;
//# sourceMappingURL=exec.js.map