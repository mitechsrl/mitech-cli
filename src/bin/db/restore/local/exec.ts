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
import { getDatabase, printDatabase } from '../../../../lib/databaseSelector';
import { logger } from '../../../../lib/logger';
import { CommandExecFunction, MitechCliFileContentDb, StringError } from '../../../../types';
import { restoreMongo } from '../../_lib/mongo';

/**
 * Generic dump method
 * @param database 
 */
async function restore(database: MitechCliFileContentDb){
    switch(database.type){
    case 'mongodb': {
        await restoreMongo(database);
        break;
    }
    default: throw new StringError('Il tipo di database <'+(database.type??'')+'> non è supportato');
    }
    
}

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    logger.warn('NOTA: la selezione verrà usata solo per determinare il tipo di database. Non verranno effettuate altre operazioni.');
    const database = await getDatabase();
    printDatabase(database);

    await restore(database);
};

export default exec;