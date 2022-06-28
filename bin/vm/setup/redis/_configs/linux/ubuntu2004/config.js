module.exports = {
    name: 'Ubuntu 20.04',
    value: {
        questions: [
            {
                type: 'password',
                name: 'password',
                message: 'Password accesso redis (preferibile pwd molto lunga senza caratteri speciali)'
            },
            {
                type: 'password',
                name: 'passwordConfirm',
                message: 'Conferma password accesso redis'
            }
        ]
    }
};
