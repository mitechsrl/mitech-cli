
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

import { GenericObject } from '../../../../../../../types';

const config = {
    name: 'Ubuntu 20.04, MongoDb 4.2.X (con ssl/tls self signed, auth admin, auth user)',
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

        validateAnswers: (answers: GenericObject) => {
            if (answers.adminPassword !== answers.adminPasswordConfirm) {
                throw new Error('Password utente e conferma non corrispondono');
            }
            if (answers.userPassword !== answers.userPasswordConfirm) {
                throw new Error('Password admin e conferma non corrispondono');
            }
        }
    }
};

export default config;