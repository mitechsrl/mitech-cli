const tar = require('tar');
const fs = require('fs');
const tmp = require('tmp-promise');
const logger = require('../../../lib/logger');

/**
 * Create a tar archive of the toUpload direcotry or file
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
module.exports = async (toUpload) => {
    // eslint-disable-next-line no-unused-vars
    logger.info('Compressione sorgente in corso...');
    const tmpFile = await tmp.file({ discardDescriptor: true, postfix: '.tgz' });

    const options = {
        gzip: true,
        file: tmpFile.path
    };

    await tar.c(options, [toUpload]);
    var stats = fs.statSync(tmpFile.path);
    logger.info('File: ' + tmpFile.path);
    logger.info('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
    return tmpFile;
};
