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

import fs from 'fs';
import inquirer from 'inquirer';
import _ from 'lodash';
import yargs from 'yargs';
import { encrypt } from '../../../../lib/crypto';
import { logger } from '../../../../lib/logger';
import { CommandExecFunction, GenericObject, SshTarget, MitechCliFile } from '../../../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    const questionsStart = [
        {
            type: 'input',
            name: 'name',
            message: 'Descrizione'
        },
        {
            type: 'input',
            name: 'host',
            message: 'Host remoto (ip oppure hostname)'
        },
        {
            type: 'number',
            name: 'port',
            message: 'Porta ssh',
            default: 22
        },
        {
            type: 'input',
            name: 'username',
            message: 'Username ssh'
        },
        {
            type: 'list',
            name: 'accessType',
            message: 'Quale tipologia di autenticazione si vuole usare?',
            choices: [{ name: 'password', value: 'password' }, { name: 'chiave ssh', value: 'sshKey' }]
        }
    ];
    const questionsPassword = [
        {
            type: 'password',
            message: 'Password ssh',
            name: 'password',
            mask: true
        },
        {
            type: 'password',
            message: 'Conferma password ssh',
            name: 'password2',
            mask: true
        }
    ];
    const questionsSsh = [
        {
            type: 'input',
            message: 'Chiave ssh (path assoluto)',
            name: 'sshKey'
        }
    ];
    const questionsFinal = [
        {
            type: 'input',
            name: 'nodeUser',
            message: 'Utente dedicato ai processi node',
            default: 'onit'
        }
    ];

    const answers: SshTarget = await inquirer.prompt(questionsStart);
    if (answers.accessType === 'password') {
        while (1) {
            const _answers = await inquirer.prompt(questionsPassword);
            if (_answers.password === _answers.password2) {
                delete _answers.password2;
                Object.assign(answers, _answers);
                break;
            } else {
                logger.warn('Le password non coincidono. Digitale di nuovo.');
            }
        }
    } else {
        Object.assign(answers, await inquirer.prompt(questionsSsh));
    }

    Object.assign(answers, await inquirer.prompt(questionsFinal));
    answers.port = answers.port || 22;
    answers.nodeUser = answers.nodeUser || 'onit';

    let _t: GenericObject = {
        targets: [] as SshTarget[]
    };

    let fileName = '.mitechcli';
    if (fs.existsSync(fileName)) {
        _t = JSON.parse(fs.readFileSync(fileName).toString());
    } else {
        fileName = fileName + '.json';
        if (fs.existsSync(fileName)) {
            _t = JSON.parse(fs.readFileSync(fileName).toString());
        }
    }

    if (answers.accessType === 'password') {
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        answers.password = encrypt(encryptionKey, answers.password as string);
    }
    _t.targets = _t.targets || [];
    _t.targets.push(answers);
    fs.writeFileSync(fileName, JSON.stringify(_t, null, 4));
    logger.log('Target creato');
};

export default exec;

