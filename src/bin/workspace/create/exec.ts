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

import { mkdir, mkdirSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { join } from 'path';
import yargs, { choices } from 'yargs';
import { logger } from '../../../lib/logger';
import { buildNpmrc, getRegistry } from '../../../lib/npm';
import { spawn } from '../../../lib/spawn';
import { CommandExecFunction, GenericObject } from '../../../types';
import { npmScope } from '../../npm/npmConstants';
import { copyTemplate } from './_lib/copyTemplate';
import { setupGit } from './_lib/setupGit';
import { packageJsonBuilder } from './_lib/packageJsonBuilder';

type PackageItem = {
    name: string,
    dir: string,
    git: string
};

// prepopulated list of packages
const subpackagesList: PackageItem[] = [
    { name: '@mitech/onit-next',dir: 'onit-next', git:'https://github.com/mitechsrl/onit-next.git' } ,
    { name: '@mitech/onit-ui',dir: 'onit-ui', git:'https://github.com/mitechsrl/onit-ui.git' } ,
    { name: '@mitech/onit-ui-auth', dir: 'onit-ui-auth', git:'https://github.com/mitechsrl/onit-ui-auth.git' }, 
    { name: '@mitech/onit-things', dir: 'onit-things', git:'https://github.com/mitechsrl/onit-things.git' },
    { name: '@mitech/onit-industry', dir: 'onit-industry', git:'https://github.com/mitechsrl/onit-industry.git' },
    { name: '@mitech/onit-next-react-components', dir: 'onit-next-react-components', git:'https://github.com/mitechsrl/onit-next-react-components.git' },
    { name: '@mitech/onit-analytics', dir:'onit-analytics', git: 'https://github.com/mitechsrl/onit-analytics.git' }
];

function toInquirerList(list: PackageItem[]){
    return list.map(item => {
        return {
            name: item.name,
            value: item
        };
    });
}
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {
    logger.log('Questo tool creerà un workspace npm nella directory corrente');

    const answers = await inquirer.prompt([
        {
            type:'input',
            name:'name',
            message:'Nome'
        },
        {
            type:'checkbox',
            name:'subpackages',
            message:'Pacchetti workspace',
            choices: toInquirerList(subpackagesList)
        },
        {
            type:'list',
            name:'mainPackage',
            message:'Pacchetto di serve',
            when: (answers: GenericObject) => {
                // do not ask if no submodules were added
                return answers.subpackages.length>0;
            },
            choices: (answers: GenericObject) => {
                return toInquirerList(answers.subpackages);
            }
        },
    ]);

    // some fixes to have valid names
    answers.name = answers.name.replace(/ /g,'-');
    answers.name = answers.name.replace(/[^a-zA-Z0-9_\-/]/g,'');
    
    const path = join(process.cwd(), './'+answers.name);
    const currentCwd = process.cwd();
    
    // create the dir and move into it
    mkdirSync(path);
    process.chdir(path);
    
    // create package.json
    packageJsonBuilder(answers);
     
    // add .npmrc to allow login in out npm registry
    const registry = await getRegistry(npmScope);
    writeFileSync('.npmrc', buildNpmrc(registry, 'managementAccount'));
    
    // setup git
    await setupGit(answers);

    // copy and render all the other repository files
    await copyTemplate(answers);

    logger.success(':pizza: :beer: Workspace creato! :top: :top:');
    logger.log('Setup workspace completo. Esegui');
    logger.log('> cd '+answers.name);
    logger.log('> npm install');
    logger.log('> npm run precompile');
    logger.log('> npm start');
    logger.log('Per aggiungere un remote git, Esegui');
    logger.log('> git remote add origin <URL-GIT-REPOSITORY>');

    process.chdir(currentCwd);
    
};

export default exec;