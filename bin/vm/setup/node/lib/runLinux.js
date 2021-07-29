const inquirer = require('inquirer');
const path = require('path');

module.exports = (session, answers) => {
    const questions = [
        {
            type: 'list',
            name: 'mode',
            message: 'Modalità di setup',
            choices: [
                {
                    name: 'Ubuntu 20.04, Node 12.X, Nginx, pm2, nodemon',
                    value: 'ubuntu2004_node12'
                },
                {
                    name: 'Ubuntu 20.04, Node 14.X, Nginx, pm2, nodemon',
                    value: 'ubuntu2004_node14'
                }
            ]
        }
    ];

    return inquirer.prompt(questions)
        .then(_answers => {
            const linuxCmds = require(path.join(__dirname, '../' + _answers.mode + '/commands.js'));
            return linuxCmds(session, answers);
        });
};
