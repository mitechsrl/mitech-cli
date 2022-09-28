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

import yargs from 'yargs';
import { logger } from '../../../../lib/logger';
import { CommandExecFunction } from '../../../../types';
import { getNpmPersistent, setNpmPersistent } from '../../../../lib/npm';
import inquirer from 'inquirer';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const registies = getNpmPersistent();

    const questions = [
        {
            type: 'input',
            name: 'id',
            message: 'id (caratteri accettati a-z, A-Z, 0-9, -)'
        },
        {
            type: 'input',
            name: 'scope',
            message: 'scope (@somename)'
        },
        {
            type: 'input',
            name: 'registry',
            message: 'Url registry (con https:// e / finale)'
        },
        {
            type: 'input',
            name: 'manage_username',
            message: 'Username utente management'
        },
        {
            type: 'password',
            name: 'manage_password',
            message: 'Password utente management'
        },
        {
            type: 'input',
            name: 'readonly_username',
            message: 'Username utente readonly'
        },
        {
            type: 'password',
            name: 'readonly_password',
            message: 'Password utente readonly'
        }
    ];

    inquirer.prompt(questions).then(answers => {
        const registry = {
            id: answers.id.replace(/[^a-zA-Z0-9-]/g, ''),
            registry: answers.registry,
            scope: answers.scope,
            managementAccount: {
                username: answers.manage_username,
                password: answers.manage_password
            },
            readonlyAccount: {
                username: answers.readonly_username,
                password: answers.readonly_password
            }
        };

        registies.push(registry);
        registies.sort((a, b) => (a === b) ? 0 : (a < b) ? -1 : 1);
        setNpmPersistent(registies);
        logger.info('Registry aggiunto');
    });
};

export default exec;