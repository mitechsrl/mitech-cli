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
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = require("path");
const logger_1 = require("../../../lib/logger");
const npm_1 = require("../../../lib/npm");
const npmConstants_1 = require("../../npm/npmConstants");
const copyTemplate_1 = require("./_lib/copyTemplate");
const setupGit_1 = require("./_lib/setupGit");
const packageJsonBuilder_1 = require("./_lib/packageJsonBuilder");
// prepopulated list of packages
const subpackagesList = [
    { name: '@mitech/onit-next', dir: 'onit-next', git: 'https://github.com/mitechsrl/onit-next.git' },
    { name: '@mitech/onit-ui', dir: 'onit-ui', git: 'https://github.com/mitechsrl/onit-ui.git' },
    { name: '@mitech/onit-ui-auth', dir: 'onit-ui-auth', git: 'https://github.com/mitechsrl/onit-ui-auth.git' },
    { name: '@mitech/onit-things', dir: 'onit-things', git: 'https://github.com/mitechsrl/onit-things.git' },
    { name: '@mitech/onit-industry', dir: 'onit-industry', git: 'https://github.com/mitechsrl/onit-industry.git' },
    { name: '@mitech/onit-next-react-components', dir: 'onit-next-react-components', git: 'https://github.com/mitechsrl/onit-next-react-components.git' },
    { name: '@mitech/onit-analytics', dir: 'onit-analytics', git: 'https://github.com/mitechsrl/onit-analytics.git' }
];
function toInquirerList(list) {
    return list.map(item => {
        return {
            name: item.name,
            value: item
        };
    });
}
const exec = async (argv) => {
    logger_1.logger.log('Questo tool creerà un workspace npm nella directory corrente');
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Nome'
        },
        {
            type: 'checkbox',
            name: 'subpackages',
            message: 'Pacchetti workspace',
            choices: toInquirerList(subpackagesList)
        },
        {
            type: 'list',
            name: 'mainPackage',
            message: 'Pacchetto di serve',
            when: (answers) => {
                // do not ask if no submodules were added
                return answers.subpackages.length > 0;
            },
            choices: (answers) => {
                return toInquirerList(answers.subpackages);
            }
        },
    ]);
    // some fixes to have valid names
    answers.name = answers.name.replace(/ /g, '-');
    answers.name = answers.name.replace(/[^a-zA-Z0-9_\-/]/g, '');
    const path = (0, path_1.join)(process.cwd(), './' + answers.name);
    const currentCwd = process.cwd();
    // create the dir and move into it
    (0, fs_1.mkdirSync)(path);
    process.chdir(path);
    // create package.json
    (0, packageJsonBuilder_1.packageJsonBuilder)(answers);
    // add .npmrc to allow login in out npm registry
    const registry = await (0, npm_1.getRegistry)(npmConstants_1.npmScope);
    (0, fs_1.writeFileSync)('.npmrc', (0, npm_1.buildNpmrc)(registry, 'managementAccount'));
    // setup git
    await (0, setupGit_1.setupGit)(answers);
    // copy and render all the other repository files
    await (0, copyTemplate_1.copyTemplate)(answers);
    logger_1.logger.success(':pizza: :beer: Workspace creato! :top: :top:');
    logger_1.logger.log('Setup workspace completo. Esegui');
    logger_1.logger.log('> cd ' + answers.name);
    logger_1.logger.log('> npm install');
    logger_1.logger.log('> npm run precompile');
    logger_1.logger.log('> npm start');
    logger_1.logger.log('Per aggiungere un remote git, Esegui');
    logger_1.logger.log('> git remote add origin <URL-GIT-REPOSITORY>');
    process.chdir(currentCwd);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map