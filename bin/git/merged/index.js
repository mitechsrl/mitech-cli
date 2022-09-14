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

const inquirer = require('inquirer');
const inquirerPrompt = require('inquirer-autocomplete-prompt');
const logger = require('../../../lib/logger');
const spawn = require('../../../lib/spawn');

module.exports.info = 'Verifica merge branches';
module.exports.help = [
    'Dato il nome di una branch, mostra lo stato di merge all\'interno della branch corrente',
    ['-b', 'Nome branch da verificare. Opzionale, se non passata viene chiesta via prompt.']
];

module.exports.cmd = async function (basepath, params) {
    const branchParam = params.get('-b');
    let branchName = '';

    if (branchParam.found) {
        branchName = branchParam.value;
    } else {
        const _branches = await spawn('git', ['branch', '-a'], false);
        const branches = _branches.data.split('\n').map(l => {
            l = l.trim().replace(/^\* /, '');
            return l;
        }).filter(l => !!l);

        inquirer.registerPrompt('autocomplete', inquirerPrompt);
        const answers = await inquirer.prompt([{
            type: 'autocomplete',
            name: 'branchName',
            message: 'Seleziona nome branch da verificare',
            source: (answers, input = '') => {
                return branches.filter(b => b.indexOf(input) >= 0);
            }
        }]);

        branchName = answers.branchName;
    }

    const mergedBranchList = await spawn('git', ['branch', '-a', '--merged'], false);
    const unmergedBranchList = await spawn('git', ['branch', '-a', '--no-merged'], false);

    const merged = (mergedBranchList.data || '').indexOf(branchName) >= 0;
    const unmerged = (unmergedBranchList.data || '').indexOf(branchName) >= 0;

    if (!merged && !unmerged) {
        logger.error('La branch specificata non esiste');
        return;
    }
    /* Non sembra funzionare

    if (merged && unmerged) {
        const count = await spawn('git', ['rev-list', '--count', branchName, '^HEAD'], false);
        logger.warn(`La branch è stata mergiata in precedenza, ma presenta ${count.data.trim()} commit recenti non mergiate.`);
        logger.log('');
        logger.log('Commit non mergiate: ');

        const commits = await spawn('git', ['log', '--no-merges', branchName, '^HEAD', '--pretty=format:"%h - %s - %ad"'], false);
        logger.log(commits.data);
    } else */if (merged) {
        const mergeHash = await spawn('git', ['merge-base', 'HEAD', branchName], false);
        logger.info('La branch è stata mergiata in precedenza ed è aggiornata, non devi fare nulla. Commit di merge: ' + mergeHash.data.trim());
        const log = await spawn('git', ['log', '-1', mergeHash.data.trim()], false);
        logger.log('');
        logger.log(log.data);
    } else if (unmerged) {
        logger.error('La branch NON è stata mergiata');
        // is unmerged now, but check if it was unmerged also in the past
        const count = await spawn('git', ['rev-list', '--count', branchName, '^HEAD'], false);
        if (parseInt(count.data.trim()) >= 0) {
            logger.log('Commit pendenti non mergiate: ');
            const commits = await spawn('git', ['log', '--no-merges', branchName, '^HEAD', '--pretty=format:"%h - %s - %ad"'], false);
            logger.log(commits.data);
        }
    } else {
        logger.warn(':confused: Mmm... la branch non è nè merged, nè unmerged... chiedi al cane, se abbaia due volte allora è merged.');
    }

    logger.log('');
};
