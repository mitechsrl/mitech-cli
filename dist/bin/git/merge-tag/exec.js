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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../lib/logger");
const spawn_1 = require("../../../lib/spawn");
const types_1 = require("../../../types");
const branchSelector_1 = require("../_lib/branchSelector");
const prettyFormat_1 = require("../_lib/prettyFormat");
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
const exec = async (argv) => {
    logger_1.logger.log('Eseguo git fetch...');
    // faccio fetch per avere info sulle commit in master
    await (0, spawn_1.spawn)('git', ['fetch'], false);
    const status = await (0, spawn_1.spawn)('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger_1.logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
        return;
    }
    // becco il nome della branch master. Deve essere master o main
    const _masterBranch = await (0, spawn_1.spawn)('git', ['branch', '-l', 'main', 'master', '--format', '%(refname:short)'], false);
    const masterBranchName = _masterBranch.output.trim();
    if (!masterBranchName)
        throw new types_1.StringError('Non riesco a trovare il nome della branch master');
    let branchName = argv.b;
    // chiedi il nome branch nel caso non sia stata passata 
    if (!branchName) {
        branchName = await (0, branchSelector_1.branchSelector)();
    }
    const mergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await (0, spawn_1.spawn)('git', ['branch', '-a', '--no-merged'], false);
    const merged = (mergedBranchList.output || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.output || '').indexOf(branchName) >= 0;
    if (!merged && !unmerged) {
        logger_1.logger.error('La branch specificata non esiste');
        return;
    }
    if (merged) {
        const mergeHash = await (0, spawn_1.spawn)('git', ['merge-base', 'HEAD', branchName], false);
        const mergeCommit = mergeHash.output.trim();
        const mergecommit = await (0, spawn_1.spawn)('git', ['log', '-1', mergeHash.output.trim()], false);
        logger_1.logger.log('Commit di merge: ');
        logger_1.logger.log(mergecommit.output);
        logger_1.logger.log('');
        const log = await (0, spawn_1.spawn)('git', ['log', prettyFormat_1.prettyFormat, mergeCommit + '..' + masterBranchName], false);
        const lines = log.output.split('\n');
        if (lines.length === 0) {
            logger_1.logger.error('Non ho trovato commit in master/main dopo il merge della branch. Non posso determinare se ci siano build successive.');
            return;
        }
        const tags = [];
        lines.forEach(l => {
            const m = l.match(/.*- +(V[0-9]+\.[0-9]+\.[0-9]+)["]*$/);
            if (m) {
                tags.push(m[1]);
            }
        });
        logger_1.logger.log('Lista di commit in master/main successive a merge:');
        logger_1.logger.log(lines.join('\n'));
        logger_1.logger.log('');
        if (tags.length > 0) {
            logger_1.logger.success('Ho trovato i seguenti tag che includono il merge: ' + tags.join(', '));
        }
        else {
            logger_1.logger.error('Non ho trovato tag dopo il merge. La merge non è inclusa in nessun tag.');
        }
    }
    else if (unmerged) {
        logger_1.logger.error('La branch contiene commit non mergiate. Esegui merge prima!');
    }
    else {
        logger_1.logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged. https://www.youtube.com/watch?v=A5V_pz848oA');
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
    logger_1.logger.log('');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map