import inquirer from 'inquirer';
import { spawn } from '../../../lib/spawn';
import { GenericObject } from '../../../types';
import inquirerPrompt from 'inquirer-autocomplete-prompt';

/**
 * Display a inquirer prompt asking for a local repository branch
 * @returns 
 */
export async function branchSelector(){
    // chiedi il nome branch nel caso non sia stata passata 
    
    const _branches = await spawn('git', ['branch', '-a'], false);
    const branches = _branches.output.split('\n').map(l => {
        l = l.trim().replace(/^\* /, '');
        return l;
    }).filter(l => !!l);

    inquirer.registerPrompt('autocomplete', inquirerPrompt);
    const answers = await inquirer.prompt([{
        type: 'autocomplete',
        name: 'branchName',
        message: 'Seleziona nome branch da verificare',
        source: (answers: GenericObject, input = '') => {
            return branches.filter(b => b.indexOf(input) >= 0);
        }
    }]);

    return answers.branchName;
    
}