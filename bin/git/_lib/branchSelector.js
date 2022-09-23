const inquirer = require('inquirer');
const inquirerPrompt = require('inquirer-autocomplete-prompt');
const spawn = require('../../../lib/spawn');

/**
 * Prompt the branch selection in the repository at the current working directory
 * @param {*} params cli params
 * @returns
 */
module.exports.branchSelector = async (params) => {
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

    return branchName;
};
