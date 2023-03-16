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
const logger_1 = require("../../../../lib/logger");
const npm_1 = require("../../../../lib/npm");
const inquirer_1 = __importDefault(require("inquirer"));
const exec = async (argv) => {
    const registies = (0, npm_1.getNpmPersistent)();
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
    inquirer_1.default.prompt(questions).then(answers => {
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
            },
            npmrcPath: '' // this is set at runtime
        };
        registies.push(registry);
        registies.sort((a, b) => (a === b) ? 0 : (a < b) ? -1 : 1);
        (0, npm_1.setNpmPersistent)(registies);
        logger_1.logger.info('Registry aggiunto');
    });
};
exports.default = exec;
//# sourceMappingURL=exec.js.map