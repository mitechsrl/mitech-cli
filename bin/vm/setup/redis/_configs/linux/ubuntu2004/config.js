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
        ],
        validateAnswers: (answers) => {
            if (answers.password !== answers.passwordConfirm) {
                throw new Error('Password e conferma non corrispondono');
            }
        }
    }
};
