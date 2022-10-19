import { spawn } from '../../../../lib/spawn';
import { GenericObject } from '../../../../types';

/**
 * setup the current git directory
 * @param answers 
 */
export async function initGit(answers: GenericObject){

    await spawn('git',['init'], true);
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