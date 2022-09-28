"use strict";
/*const tar = require('tar');
const path = require('path');
const fs = require('fs');
const ignore = require('ignore');
const tmp = require('tmp-promise');
const logger = require('../../../../lib/logger');
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const tmp_promise_1 = require("tmp-promise");
const logger_1 = require("../../../../lib/logger");
const tar_1 = __importDefault(require("tar"));
const ignore_1 = __importDefault(require("ignore"));
/**
 * Create a tar archive of the process.cwd() directory
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
async function createPackage() {
    // prepara gestione ignore files
    let mitechcliignoreFile = '';
    if ((0, fs_1.existsSync)('.mitechcliignore')) {
        mitechcliignoreFile = (0, fs_1.readFileSync)('.mitechcliignore').toString();
    }
    const ignoreFilters = mitechcliignoreFile.split('\n').map(v => v.trim()).filter(v => v !== '').filter(v => v[0] !== '#');
    // some default ignores
    ignoreFilters.push('node_modules', '.git', 'deploy-backups');
    const ig = (0, ignore_1.default)().add(ignoreFilters);
    // filtra i files da caricare
    const filter = (_path) => {
        const _p = path_1.default.relative(process.cwd(), _path);
        // main folder
        if (_p === '')
            return true;
        // everything else
        const filteredOut = ig.ignores(_p);
        if (!filteredOut) {
            console.log(_p); // stampa files che vengono caricati
        }
        return !filteredOut;
    };
    // eslint-disable-next-line no-unused-vars
    logger_1.logger.info('Compressione cartella corrente in corso...');
    const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.tgz' });
    await tar_1.default.c({
        gzip: true,
        file: tmpFile.path,
        filter: filter
    }, ['./']);
    const stats = (0, fs_1.statSync)(tmpFile.path);
    logger_1.logger.info('File: ' + tmpFile.path);
    logger_1.logger.info('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
    return tmpFile;
}
exports.createPackage = createPackage;
//# sourceMappingURL=createPackage.js.map