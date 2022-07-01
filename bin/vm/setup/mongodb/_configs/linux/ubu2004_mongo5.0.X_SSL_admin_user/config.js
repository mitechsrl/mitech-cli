// the config of this directory is an item for inquirer list

module.exports = {
    name: 'Ubuntu 20.04, MongoDb 5.0.X (ssl/tls self signed, auth admin, auth user, support to onit-next/LB4 )',
    value: {
        questions: [
            {
                type: 'password',
                name: 'adminPassword',
                message: 'Password utente admin'
            },
            {
                type: 'password',
                name: 'adminPasswordConfirm',
                message: 'Conferma password utente admin'
            },
            {
                type: 'input',
                name: 'userUsername',
                message: 'Username utente per app'
            },
            {
                type: 'password',
                name: 'userPassword',
                message: 'Password utente per app'
            },
            {
                type: 'password',
                name: 'userPasswordConfirm',
                message: 'Conferma password utente app'
            },
            {
                type: 'input',
                name: 'mongoPath',
                default: 'default',
                message: 'Path storage (se disco aggiuntivo deve già essere montato, lassciare vuoto per default)?'
            }
        ],
        validateAnswers: (answers) => {
            if (answers.adminPassword !== answers.adminPasswordConfirm) {
                throw new Error('Password utente e conferma non corrispondono');
            }
            if (answers.userPassword !== answers.userPasswordConfirm) {
                throw new Error('Password admin e conferma non corrispondono');
            }
        }
    }
};
