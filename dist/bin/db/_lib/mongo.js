"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropLocalDatabase = exports.mongoServerBin = exports.getMongodumpBinPath = exports.getMongorestoreBinPath = exports.dumpMongo = exports.selectMongodumpDir = exports.restoreMongo = void 0;
const spawn_1 = require("../../../lib/spawn");
const types_1 = require("../../../types");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const stream_1 = require("stream");
const node_fetch_1 = __importDefault(require("node-fetch"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const inquirer_1 = __importDefault(require("inquirer"));
const glob_1 = __importDefault(require("glob"));
const TMP_PATH = path_1.default.resolve(os_1.default.homedir(), './.mitech-cli/');
const streamPipeline = util_1.default.promisify(stream_1.pipeline);
// this one support mongodb>=4.2 to <=6
const WINDOWS_BASE_HTTP_PATH = 'https://fastdl.mongodb.org/tools/db/';
const WINDOWS_MONGOTOOL_VERSION = 'mongodb-database-tools-windows-x86_64-100.6.0';
const WINDOWS_BIN_PATH = path_1.default.resolve(TMP_PATH, './mongotools_win');
/**
 * File download helper
 *
 * @param url the url of the remote file
 * @param destination the local destination path
 */
async function download(url, destination) {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok)
        throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs_1.default.createWriteStream(destination));
}
/**
 * Get the mongotools dir for windows.
 * If the dir is not available, a download and extaction of the tools is performed
 *
 * @param version The version to download. Check this on mongodb download page
 * @param tmpPath The destination download directory
 * @param binPath The destination directory where zip archive is extracted
 */
async function getMongotoolsDirWindows() {
    const p = path_1.default.join(WINDOWS_BIN_PATH, './' + WINDOWS_MONGOTOOL_VERSION);
    if (!fs_1.default.existsSync(p)) {
        const httpZip = WINDOWS_BASE_HTTP_PATH + WINDOWS_MONGOTOOL_VERSION + '.zip';
        console.log(`One time mongotools download: ${httpZip}`);
        console.log('Please wait...');
        fs_1.default.mkdirSync(WINDOWS_BIN_PATH, { recursive: true });
        const zipArchive = path_1.default.join(p + '.zip');
        await download(httpZip, zipArchive);
        await (0, extract_zip_1.default)(zipArchive, { dir: WINDOWS_BIN_PATH });
    }
    return path_1.default.join(p, './bin');
}
/**
 * Check availability of mongo tools on linux
 * There's too much variability for different distros, We let the user install himself mongotools for his platform
 */
async function checkMongoToolsLinux(file) {
    if (!fs_1.default.existsSync(file)) {
        throw new types_1.StringError('Mongo tools non trovati. Vedi https://www.mongodb.com/docs/database-tools/installation/installation-linux/ per info');
    }
}
/**
 * Get the path to the mongodump tool.
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 *
 * @returns
 */
async function getMongodumpBinPath() {
    if (os_1.default.platform() === 'win32') {
        return path_1.default.join(await getMongotoolsDirWindows(), './mongodump.exe');
    }
    if (os_1.default.platform() === 'linux') {
        await checkMongoToolsLinux('/usr/bin/mongodump');
        return '/usr/bin/mongodump';
    }
    throw new Error('getMongodumpBinPath not implemented for ' + os_1.default.platform());
}
exports.getMongodumpBinPath = getMongodumpBinPath;
/**
 * Get the path to the mongoirestore tool.
 * On windows, mongotools is a separate packages of executables not shipped with mongodb.
 * To hide the need to have them, a local copy is downloaded on the fly from mongodb website
 *
 * @returns
 */
async function getMongorestoreBinPath() {
    if (os_1.default.platform() === 'win32') {
        return path_1.default.join(await getMongotoolsDirWindows(), './mongorestore.exe');
    }
    if (os_1.default.platform() === 'linux') {
        await checkMongoToolsLinux('/usr/bin/mongorestore');
        return '/usr/bin/mongorestore';
    }
    throw new Error('getMongorestoreBinPath not implemented for ' + os_1.default.type());
}
exports.getMongorestoreBinPath = getMongorestoreBinPath;
/**
  * Calcola la directory di destinazione del dump
  *
  * @param database
  * @returns
  */
function buildOutDir(database) {
    var _a;
    const safeFilename = database.name.replace(/[^a-zA-Z0-9-_.]/g, '-');
    const safeTimestamp = new Date().toISOString().replace(/[^a-zA-Z0-9-_.]/g, '-');
    return ((_a = database.dst) !== null && _a !== void 0 ? _a : './') + safeFilename + '-' + safeTimestamp;
}
/**
 * Build mongodum params for a given database
 *
 * @param database
 * @param databaseName
 * @returns
 */
function buildMongoDumpParams(database, outdir, databaseName) {
    var _a;
    const params = [
        '--host', database.host,
        '--port', ((_a = database.port) !== null && _a !== void 0 ? _a : '27017').toString()
    ];
    // add auth if both user & password are defined
    if (database.username && database.password) {
        params.push('--authenticationDatabase', 'admin', '--username', database.username, '--password', database.password);
    }
    if (databaseName) {
        params.push('--db', databaseName);
    }
    if (database.tls) {
        params.push('--ssl', '--sslAllowInvalidCertificates');
    }
    params.push('--out', outdir);
    return params;
}
/**
  * Dump mongodb
  * @param database
  */
async function dumpMongo(database) {
    const mongodumpBinPath = await getMongodumpBinPath();
    const outDir = buildOutDir(database);
    // no db names specified. Launch the dump for all databases
    if (!Array.isArray(database.databaseNames)) {
        const params = buildMongoDumpParams(database, outDir);
        await (0, spawn_1.spawn)(mongodumpBinPath, params);
        return;
    }
    // per db multipli occorre rilanciare mongodump piu volte. Itero sui npmi db
    for (const databaseName of database.databaseNames) {
        const params = buildMongoDumpParams(database, outDir, databaseName);
        await (0, spawn_1.spawn)(mongodumpBinPath, params);
    }
}
exports.dumpMongo = dumpMongo;
/**
 * Prompt the user to select a directory. Directories are detected based on their name format.
 * @param database
 * @returns
 */
async function selectMongodumpDir(database) {
    var _a;
    // this must match the names build with buildOutDir
    const safeFilename = database.name.replace(/[^a-zA-Z0-9-_.]/g, '-').replace(/\./g, '\\.');
    const scanDir = ((_a = database.dst) !== null && _a !== void 0 ? _a : './');
    const files = fs_1.default.readdirSync(scanDir).filter(f => {
        // only dirs, no files (no support for zip or something like this)
        const stat = fs_1.default.statSync(path_1.default.join(scanDir, f));
        if (!stat.isDirectory())
            return false;
        // this match dir names, hwever it might not be a mongo dump dir. Don't checking this,
        // leave the user to select something valid.
        return !!f.match(new RegExp('^' + safeFilename + '-(.*)$'));
    }).map(file => {
        const dir = path_1.default.join(scanDir, file);
        const databases = fs_1.default.readdirSync(dir);
        return {
            name: dir + ' (' + databases.join(', ') + ')',
            value: dir
        };
    });
    if (files.length === 0)
        throw new types_1.StringError('Nessun dump trovato');
    const questions = [{
            type: 'list',
            name: 'dump',
            message: 'Seleziona dump',
            choices: files
        }];
    const answers = await inquirer_1.default.prompt(questions);
    if (!answers.dump)
        throw new types_1.StringError('Nessun dump selezionato');
    // return the directory to be restored
    return answers.dump; // that's a string
}
exports.selectMongodumpDir = selectMongodumpDir;
/**
 *
 * @param database
 */
async function restoreMongo(dump, database) {
    const mongoresoreBinPath = await getMongorestoreBinPath();
    await (0, spawn_1.spawn)(mongoresoreBinPath, [dump]);
}
exports.restoreMongo = restoreMongo;
/**
 * Search the mongo bin on this system
 */
async function mongoServerBin() {
    if (os_1.default.platform() === 'win32') {
        const promiseGlob = util_1.default.promisify(glob_1.default);
        const dirs = [...new Set([
                process.env['ProgramFiles'],
                process.env['ProgramFiles(x86)'],
                process.env['ProgramW6432']
            ])]
            .filter(d => !!d) // remove null dirs
            .map((p) => path_1.default.join(p, './MongoDB/Server'));
        const found = [];
        for (const d of dirs) {
            if (found.length > 0)
                continue; // stop at the first found
            const bins = await promiseGlob('./**/mongo.exe', { dot: true, cwd: d });
            found.push(...bins.map(bin => path_1.default.join(d, bin)));
        }
        if (found.length === 0)
            throw new types_1.StringError('No mongo.exe bin found on this system');
        return found[0];
    }
    else {
        throw new types_1.StringError('Not implemented for ' + os_1.default.platform());
    }
}
exports.mongoServerBin = mongoServerBin;
/**
 *
 * @param dbName
 * @param database
 */
async function dropLocalDatabase(dbName, database) {
    const mongoBin = await mongoServerBin();
    await (0, spawn_1.spawn)(mongoBin, [dbName, '--eval', 'db.dropDatabase()'], true);
}
exports.dropLocalDatabase = dropLocalDatabase;
//# sourceMappingURL=mongo.js.map