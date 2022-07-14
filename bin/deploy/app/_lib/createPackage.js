const tar = require('tar');
const path = require('path');
const fs = require('fs');
const ignore = require('ignore');
const tmp = require('tmp-promise');
const logger = require('../../../../lib/logger');

/**
 * Create a tar archive of the process.cwd() directory
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
module.exports = async () => {
    // prepara gestione ignore files
    let mitechcliignoreFile = '';
    if (fs.existsSync('.mitechcliignore')) {
        mitechcliignoreFile = fs.readFileSync('.mitechcliignore').toString();
    }
    const ignoreFilters = mitechcliignoreFile.split('\n').map(v => v.trim()).filter(v => v !== '').filter(v => v[0] !== '#');
    // some default ignores
    ignoreFilters.push(
        'node_modules',
        '.git',
        'deploy-backups'
    );
    const ig = ignore().add(ignoreFilters);

    // filtra i files da caricare
    const filter = (_path, entry) => {
        const _p = path.relative(process.cwd(), _path);
        // main folder
        if (_p === '') return true;

        // everything else
        const filteredOut = ig.ignores(_p);
        if (!filteredOut) {
            console.log(_p); // stampa files che vengono caricati
        }
        return !filteredOut;
    };

    // eslint-disable-next-line no-unused-vars
    logger.info('Compressione cartella corrente in corso...');
    const tmpFile = await tmp.file({ discardDescriptor: true, postfix: '.tgz' });

    await tar.c({
        gzip: true,
        file: tmpFile.path,
        filter: filter
    }, ['./']);
    const stats = fs.statSync(tmpFile.path);
    logger.info('File: ' + tmpFile.path);
    logger.info('Filesize: ' + (stats.size / 1024).toFixed(1) + 'Kb');
    return tmpFile;
};
