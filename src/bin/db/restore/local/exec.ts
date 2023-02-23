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
import { dropLocalDatabase, restoreMongo, selectMongodumpDir } from '../../_lib/mongo';

/**
 * Generic dump method
 * @param database 
 */
async function restore(database: MitechCliFileContentDb, argv: yargs.ArgumentsCamelCase<unknown>){
    switch(database.type){
    case 'mongodb': {
        const dir = await selectMongodumpDir(database);

        // drop the databases before running the restore
        if (argv.drop){
            for(const n of database.databaseNames??[]){
                await dropLocalDatabase(n, database);
            }
        }
        
        await restoreMongo(dir, database);
        break;
    }
    default: throw new StringError('Il tipo di database <'+(database.type??'')+'> non è supportato');
    }
    
}

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    logger.warn('NOTA: la selezione verrà usata solo per determinare il tipo di database. Non verranno effettuate altre operazioni.');
    const database = await getDatabase();
    printDatabase(database);

    /**/
    await restore(database, argv);
};

export default exec;