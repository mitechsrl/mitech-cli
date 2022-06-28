const inquirer = require('inquirer');
const path = require('path');
const directoryConfigsScanner = require('../../../../../lib/directoryConfigsScanner');

module.exports = async (session) => {
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

    let mode = null;
    // ask the user for the configuration to be used, the run it
    return inquirer.prompt(questions)
        .then(_mode => {
            mode = _mode.mode;
            if (mode.questions) {
                return inquirer.prompt(mode.questions);
            }
            return {};
        })
        .then(_answers => {
            if (_answers.password !== _answers.passwordConfirm) {
                throw (new Error('Password e conferma non corrispondono'));
            }

            const linuxCmds = require(path.join(mode.dir + '/commands.js'));
            return linuxCmds(session, _answers);
        });
};
