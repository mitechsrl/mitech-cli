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

import yargs from 'yargs';
import inquirer from 'inquirer';

export async function confirm(argv: yargs.ArgumentsCamelCase<unknown>, message:string){
    if (argv.y) return true;
    
    const response = await inquirer.prompt({
        type: 'confirm',
        name: 'value',
        message: message
    });
    return response.value;

}