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
import { MitechCliFileContentDb } from '../../../types';
/**
 * Get the path to the mongodump tool.
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 *
 * @returns
 */
declare function getMongodumpBinPath(): Promise<string>;
/**
 * Get the path to the mongoirestore tool.
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 *
 * @returns
 */
declare function getMongorestoreBinPath(): Promise<string>;
/**
  * Dump mongodb
  * @param database
  */
declare function dumpMongo(database: MitechCliFileContentDb): Promise<{
    outDir: string;
}>;
/**
 * Prompt the user to select a directory. Directories are detected based on their name format.
 * @param database
 * @returns
 */
declare function selectMongodumpDir(database: MitechCliFileContentDb): Promise<string>;
/**
 *
 * @param database
 */
declare function restoreMongo(dump: string, database: MitechCliFileContentDb): Promise<void>;
/**
 * Search the mongo bin on this system
 */
declare function mongoServerBin(): Promise<string>;
/**
 *
 * @param dbName
 * @param database
 */
declare function dropLocalDatabase(dbName: string, database: MitechCliFileContentDb): Promise<void>;
export { restoreMongo, selectMongodumpDir, dumpMongo, getMongorestoreBinPath, getMongodumpBinPath, mongoServerBin, dropLocalDatabase };
