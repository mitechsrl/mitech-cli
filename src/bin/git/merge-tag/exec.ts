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

import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { CommandExecFunction, StringError } from '../../../types';
import { branchSelector } from '../_lib/branchSelector';
import { prettyFormat } from '../_lib/prettyFormat';
import inquirer from 'inquirer';

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
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    logger.log('Eseguo git fetch...');

    // faccio fetch per avere info sulle commit in master
    await spawn('git', ['fetch'], false);
    const status = await spawn('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
        return;
    }

    // becco il nome della branch master. Deve essere master o main
    const _masterBranch = await spawn('git', ['branch', '-l', 'main', 'master', '--format', '%(refname:short)'], false);
    const masterBranchName = _masterBranch.output.trim();
    if (!masterBranchName) throw new StringError('Non riesco a trovare il nome della branch master');
    
    let branchName: string = argv.b as string;
    // chiedi il nome branch nel caso non sia stata passata 
    if (!branchName) {
        branchName = await branchSelector();
    }

    const mergedBranchList = await spawn('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await spawn('git', ['branch', '-a', '--no-merged'], false);
    const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;

    if (!merged && !unmerged) {
        logger.error('La branch specificata non esiste');
        return;
    }

    if (merged) {
        const mergeHash = await spawn('git', ['merge-base', 'HEAD', branchName], false);
        const mergeCommit = mergeHash.output.trim();

        const mergecommit = await spawn('git', ['log', '-1', mergeHash.output.trim()], false);
        logger.log('Commit di merge: ');
        logger.log(mergecommit.output);
        logger.log('');
        const log = await spawn('git', ['log', prettyFormat, mergeCommit+'..'+masterBranchName], false);
        const lines = log.output.split('\n');
        if (lines.length === 0){
            logger.error('Non ho trovato commit in master/main dopo il merge della branch. Non posso determinare se ci siano build successive.');
            return;
        }

        const tags:string[] = [];
        lines.forEach(l => {    
            // FIXME: si suppone il tag sia nel formato Vx.y.z
            const m = l.match(/.*- +(V[0-9]+\.[0-9]+\.[0-9]+)["]*$/);
            if (m){
                tags.push(m[1]);
            }
        });
        logger.log('Lista di commit in master/main successive a merge:');
        logger.log(lines.join('\n'));

        logger.log('');
        if (tags.length > 0){
            logger.success('Ho trovato i seguenti tag che includono il merge: ' + tags.join(', '));
        }else{
            logger.error('Non ho trovato tag dopo il merge. La merge non è inclusa in nessun tag.');
        }

    } else if (unmerged) {
        logger.error('La branch contiene commit non mergiate. Esegui merge prima!');
    } else {
        logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged. https://www.youtube.com/watch?v=A5V_pz848oA');
    }
    
    /*
    // faccio fetch per avere info sulle commit in master
    await spawn('git', ['fetch'], false);
    const status = await spawn('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }
    
    const branch = await getBranch(argv);
    
    // Prendo tutta lahistory di master
    const masterHistory = await spawn('git',['log', prettyFormat, masterBranchName], false);
    const _branchHeadCommitId = await spawn('git',['log', '--pretty=format:"%h"', '-n','1', branch], false);
    const branchHeadCommitId = _branchHeadCommitId.output.trim().replace()
    if(!branchHeadCommitId) throw new StringError('Non riesco a trovare la commit head della branch '+branch);
    console.log('Branch head commit id: '+branchHeadCommitId);
    const masterHistoryCommits = masterHistory.output.split('\n');
    const matchCommitIndex = masterHistoryCommits.findIndex(c => c.startsWith(branchHeadCommitId));
    console.log('Match commit index: '+matchCommitIndex);
    if (matchCommitIndex>=0){
        const subHistory = masterHistoryCommits.slice(0, matchCommitIndex);
        console.log(subHistory.join('\n'));
    }
    /*

    logger.log(`Verifico diferenze tra ${branch} e ${masterBranchName}...`);
    // Elenca le commit he vanno da "head di master" fino alla head della branch
    // Se NON ci sono commit, allora 
    const headOfBranch = await spawn('git',['log', prettyFormat, branch+'..'+masterBranchName], false);

    const out = headOfBranch.output.split('\n');
    if (out.length === 0){
        logger.warn('Sono state trovate ' + out.length + ' commit nella branch ' + branch \n');
    }
    console.log(headOfBranch.output);*/

    logger.log('');
};

export default exec;