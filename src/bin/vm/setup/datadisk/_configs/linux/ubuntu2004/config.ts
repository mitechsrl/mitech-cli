import { GenericObject, StringError } from '../../../../../../../types';

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
const config = {
    name: 'Ubuntu 20.04',
    value: {
        questions: [
            {
                type: 'mountpoint',
                name: 'mountpoint',
                message: 'Mount point (path assoluto)',
                default: '/datadrive'
            }
        ],
        validateAnswers: (answers: GenericObject) => {
            if (answers.mountpoint.indexOf('\\')>=0) throw new StringError('Mount point invalido. Carattere \\ proibito');
            if (!answers.mountpoint.startsWith('/')) throw new StringError('Mount point invalido. Non è assoluto.');
        }
    }
};

export default config;
