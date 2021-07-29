// the config of this directory is an item for inquirer list

module.exports = {
    name: 'Ubuntu 20.04, MongoDb 4.4.X, ssl/tls self signed, auth admin, auth user)',
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
                message: 'Password utente app'
            },
            {
                type: 'password',
                name: 'userPasswordConfirm',
                message: 'Conferma password utente app'
            }
        ]
    }
};
