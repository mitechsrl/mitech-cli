import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn } from '../../../../lib/spawn';
import { GenericObject } from '../../../../types';
import ejs from 'ejs';

/**
 * setup the current git directory
 * @param answers 
 */
export async function initGit(answers: GenericObject){
    await spawn('git',['init'], true);
   
    const template = readFileSync(join(__dirname,'./templates/gitignore.ejs')).toString();
    const rendered = ejs.render(template, answers);
    writeFileSync(join(process.cwd(),'.gitignore'), rendered);
}

/**
 * Setup submodules from user selection
 * @param answers 
 */
export async function initGitSubmodules(answers: GenericObject){
    for (const submodule of answers.subpackages){
        await spawn('git',['submodule','add', submodule.git], true);
    }
}