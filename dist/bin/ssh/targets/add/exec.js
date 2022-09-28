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
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const crypto_1 = require("../../../../lib/crypto");
const logger_1 = require("../../../../lib/logger");
const exec = async (argv) => {
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
    const answers = await inquirer_1.default.prompt(questionsStart);
    if (answers.accessType === 'password') {
        while (1) {
            const _answers = await inquirer_1.default.prompt(questionsPassword);
            if (_answers.password === _answers.password2) {
                delete _answers.password2;
                Object.assign(answers, _answers);
                break;
            }
            else {
                logger_1.logger.warn('Le password non coincidono. Digitale di nuovo.');
            }
        }
    }
    else {
        Object.assign(answers, await inquirer_1.default.prompt(questionsSsh));
    }
    Object.assign(answers, await inquirer_1.default.prompt(questionsFinal));
    answers.port = answers.port || 22;
    answers.nodeUser = answers.nodeUser || 'onit';
    let _t = {
        targets: []
    };
    let fileName = '.mitechcli';
    if (fs_1.default.existsSync(fileName)) {
        _t = JSON.parse(fs_1.default.readFileSync(fileName).toString());
    }
    else {
        fileName = fileName + '.json';
        if (fs_1.default.existsSync(fileName)) {
            _t = JSON.parse(fs_1.default.readFileSync(fileName).toString());
        }
    }
    if (answers.accessType === 'password') {
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        answers.password = (0, crypto_1.encrypt)(encryptionKey, answers.password);
    }
    _t.targets = _t.targets || [];
    _t.targets.push(answers);
    fs_1.default.writeFileSync(fileName, JSON.stringify(_t, null, 4));
    logger_1.logger.log('Target creato');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map