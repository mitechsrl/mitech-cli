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
import { CommandExecFunction } from '../../../types';
/**
 * Get a tag

async function getTag(){
    const askTags = [];
    const lastTag = await spawn('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode === 0) && lastTag.output) {
        askTags.push({ name: 'Ultimo ('+lastTag.output.trim()+')', value: lastTag.output.trim() });
    }
    const allTags = await spawn('git', ['tag', '-l'], false);
    allTags.output.split('\n').reverse().forEach(t => {
        askTags.push({
            name: t.trim(),
            value: t.trim()
        });
    });
    if (askTags.length === 0 ) throw new StringError('Nessun tag trovato. Impossibile verificare updates');

    const answers = await inquirer.prompt([{
        type:'list',
        name: 'tag',
        message:'Seleziona tag',
        choices: askTags
    }]);

    if (!answers.tag.trim()){
        throw new StringError('Nessun tag selezionato');
    }

    return answers.tag.trim();
}
 
async function getBranch(argv: yargs.ArgumentsCamelCase<unknown>){
    let branchName: string = argv.b as string;
    // chiedi il nome branch nel caso non sia stata passata
    if (!branchName) {
        branchName = await branchSelector();
    }else{
        const mergedBranchList = await spawn('git', ['branch', '-a', '--merged'], false);
        const unmergedBranchList = await spawn('git', ['branch', '-a', '--no-merged'], false);
        const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
        const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;

        if (!merged && !unmerged) {
            throw new StringError('La branch specificata non esiste');
        }
    }

}
*/
declare const exec: CommandExecFunction;
export default exec;
