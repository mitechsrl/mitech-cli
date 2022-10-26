import { spawn } from '../../../../lib/spawn';
import { GenericObject } from '../../../../types';

/**
 * setup the current git directory
 * @param answers 
 */
export async function setupGit(answers: GenericObject){
    await spawn('git',['init'], true);

    for (const submodule of answers.subpackages){
        await spawn('git',['submodule','add', submodule.git], true);
    }

    await spawn('git',['add','.']);
    await spawn('git',['commit','-m','"Workspace setup"']);
}