import { file } from 'tmp-promise';
import { logger } from '../../../../lib/logger';
import tar from 'tar';
import { statSync } from 'fs';

/**
 * Create a tar archive of the toUpload direcotry or file
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
export async function createPackage(toUpload: string){
    // eslint-disable-next-line no-unused-vars
    logger.info('Compressione sorgente in corso...');
    const tmpFile = await file({ discardDescriptor: true, postfix: '.tgz' });

    const options = {
        gzip: true,
        file: tmpFile.path
    };

    await tar.c(options, [toUpload]);
    const stats = statSync(tmpFile.path);
    logger.info('File: ' + tmpFile.path);
    logger.info('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
    return tmpFile;
}
