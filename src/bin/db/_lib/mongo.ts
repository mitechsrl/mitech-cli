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

import { spawn } from '../../../lib/spawn';
import { MitechCliFileContentDb, StringError } from '../../../types';
import os from 'os';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import fetch from 'node-fetch';
import extract from 'extract-zip';
import inquirer from 'inquirer';

const TMP_PATH = path.resolve(os.homedir(),'./.mitech-cli/');

const streamPipeline = util.promisify(pipeline);

// this one support mongodb>=4.2 to <=6
const WINDOWS_BASE_HTTP_PATH = 'https://fastdl.mongodb.org/tools/db/';
const WINDOWS_MONGOTOOL_VERSION = 'mongodb-database-tools-windows-x86_64-100.6.0';
const WINDOWS_BIN_PATH = path.resolve(TMP_PATH,'./mongotools_win');

/**
 * File download helper
 * 
 * @param url the url of the remote file 
 * @param destination the local destination path
 */
async function download(url:string, destination:string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(destination));
}

/**
 * Get the mongotools dir for windows.
 * If the dir is not available, a download and extaction of the tools is performed
 * 
 * @param version The version to download. Check this on mongodb download page
 * @param tmpPath The destination download directory
 * @param binPath The destination directory where zip archive is extracted
 */
async function getMongotoolsDirWindows(){
    const p = path.join(WINDOWS_BIN_PATH, './'+WINDOWS_MONGOTOOL_VERSION);
    if (!fs.existsSync(p)){
        const httpZip = WINDOWS_BASE_HTTP_PATH+WINDOWS_MONGOTOOL_VERSION+'.zip';
        console.log(`One time mongotools download: ${httpZip}`);
        console.log('Please wait...');
        fs.mkdirSync(WINDOWS_BIN_PATH,{ recursive:true });
        const zipArchive = path.join(p+'.zip');
        await download(
            httpZip,
            zipArchive
        );
        await extract(zipArchive, { dir:WINDOWS_BIN_PATH });
    }
    return path.join(p,'./bin');
}

/**
 * Check availability of mongo tools on linux
 * There's too much variability for different distros, We let the user install himself mongotools for his platform
 */
async function checkMongoToolsLinux(file: string){
    if (!fs.existsSync(file)){
        throw new StringError('Mongo tools non trovati. Vedi https://www.mongodb.com/docs/database-tools/installation/installation-linux/ per info');
    }
}
/**
 * Get the path to the mongodump tool. 
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 * 
 * @returns 
 */
export async function getMongodumpBinPath(){
    if(os.platform() === 'win32'){
        return path.join(await getMongotoolsDirWindows(),'./mongodump.exe');
    }

    if(os.platform() === 'linux'){
        await checkMongoToolsLinux('/usr/bin/mongodump');
        return '/usr/bin/mongodump';
    }
    
    throw new Error('getMongodumpBinPath not implemented for '+os.platform());
}

/**
 * Get the path to the mongoirestore tool. 
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 * 
 * @returns 
 */
export async function getMongorestoreBinPath(){
    if(os.platform() === 'win32'){
        return path.join(await getMongotoolsDirWindows(),'./mongorestore.exe');
    }

    if(os.platform() === 'linux'){
        await checkMongoToolsLinux('/usr/bin/mongorestore');
        return '/usr/bin/mongorestore';
    }
    
    throw new Error('getMongorestoreBinPath not implemented for '+os.type());
}

/**
  * Calcola la directory di destinazione del dump
  * 
  * @param database 
  * @returns 
  */
function buildOutDir(database: MitechCliFileContentDb){
    const safeFilename = database.name!.replace(/[^a-zA-Z0-9-_.]/g,'-');
    const safeTimestamp = new Date().toISOString().replace(/[^a-zA-Z0-9-_.]/g,'-');
    return (database.dst ?? './')+safeFilename+'-'+safeTimestamp;
}
 
/**
 * Build mongodum params for a given database
 * 
 * @param database 
 * @param databaseName 
 * @returns 
 */
function buildMongoDumpParams(database: MitechCliFileContentDb, outdir:string, databaseName?:string):string[]{
    const params: string[] = [
        '--host', database.host!,
        '--port', (database.port ?? '27017').toString()
    ];

    // add auth if both user & password are defined
    if (database.username && database.password){
        params.push('--authenticationDatabase','admin',
            '--username', database.username, 
            '--password', database.password); 
    }
    if (databaseName){
        params.push('--db',databaseName);
    }
    
    if (database.tls){
        params.push('--ssl','--sslAllowInvalidCertificates');
    }
    params.push('--out', outdir);
    return params;
}

/**
  * Dump mongodb
  * @param database 
  */
export async function dumpMongo(database: MitechCliFileContentDb){
    const mongodumpBinPath = await getMongodumpBinPath();
    const outDir = buildOutDir(database);

    // no db names specified. Launch the dump for all databases
    if (!Array.isArray(database.databaseNames)){
        const params = buildMongoDumpParams(database, outDir);
        await spawn(mongodumpBinPath, params);
        return;
    }
 
    // per db multipli occorre rilanciare mongodump piu volte. Itero sui npmi db
    for(const databaseName of database.databaseNames){
        const params = buildMongoDumpParams(database, outDir, databaseName);
        await spawn(mongodumpBinPath, params);
    }
}

/**
 * 
 * @param database 
 */
export async function restoreMongo(database: MitechCliFileContentDb){

    // this must match the names build with buildOutDir
    const safeFilename = database.name!.replace(/[^a-zA-Z0-9-_.]/g,'-').replace(/\./g,'\\.');
    const scanDir = (database.dst ?? './');

    const files = fs.readdirSync(scanDir).filter(f => {
        
        // only dirs, no files (no support for zip or something like this)
        const stat = fs.statSync(path.join(scanDir,f));
        if (!stat.isDirectory()) return false;
        
        // this match dir names, hwever it might not be a mongo dump dir. Don't checking this,
        // leave the user to select something valid.
        return !!f.match(new RegExp('^'+safeFilename+'-(.*)$'));
    }).map(file => {
        const dir = path.join(scanDir,file);
        const databases = fs.readdirSync(dir);

        return {
            name: dir + ' ('+databases.join(', ')+')',
            value: dir
        };
    });

    if (files.length === 0) throw new StringError('Nessun dump trovato');
    
    const questions = [{
        type: 'list',
        name: 'dump',
        message: 'Seleziona dump',
        choices: files
    }];
    const answers = await inquirer.prompt(questions);
    if (!answers.dump) throw new StringError('Nessun dump selezionato');
    
    const mongoresoreBinPath = await getMongorestoreBinPath();   

    await spawn(mongoresoreBinPath, [answers.dump]);
}