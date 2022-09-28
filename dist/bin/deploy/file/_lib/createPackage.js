"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackage = void 0;
const tmp_promise_1 = require("tmp-promise");
const logger_1 = require("../../../../lib/logger");
const tar_1 = __importDefault(require("tar"));
const fs_1 = require("fs");
/**
 * Create a tar archive of the toUpload direcotry or file
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
async function createPackage(toUpload) {
    // eslint-disable-next-line no-unused-vars
    logger_1.logger.info('Compressione sorgente in corso...');
    const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.tgz' });
    const options = {
        gzip: true,
        file: tmpFile.path
    };
    await tar_1.default.c(options, [toUpload]);
    const stats = (0, fs_1.statSync)(tmpFile.path);
    logger_1.logger.info('File: ' + tmpFile.path);
    logger_1.logger.info('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
    return tmpFile;
}
exports.createPackage = createPackage;
//# sourceMappingURL=createPackage.js.map