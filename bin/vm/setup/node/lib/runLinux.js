const inquirer = require('inquirer');
const path = require('path');
const directoryConfigsScanner = require('../../../../../lib/directoryConfigsScanner');

module.exports = async (session, answers) => {
    // get the list of available configurations
    const configs = await directoryConfigsScanner(path.join(__dirname, '../_configs/linux'));
    const questions = [
        {
            type: 'list',
            name: 'mode',
            message: 'Modalità di setup',
            choices: configs
        }
    ];

    // ask the user for the configuration to be used, the run it
    return inquirer.prompt(questions)
        .then(_answers => {
            const linuxCmds = require(path.join(_answers.mode.dir + '/commands.js'));
            return linuxCmds(session, answers);
        });
};
