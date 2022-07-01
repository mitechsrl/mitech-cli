const runLinuxConfiguration = require('./runLinuxConfiguration');
const ssh = require('./ssh');
const path = require('path');
const logger = require('./logger');

/**
 * Seleziona una configurazione dalla directory configPaths e la esegue su target remoto
 * @param {*} target target remoto
 * @param {*} configPaths directory dove cercare le configurazioni
 */
module.exports.runTargetConfiguration = async (target, configPaths) => {
    let session = null;
    try {
        session = await ssh.createSshSession(target);
        if (session.os.linux) {
            await runLinuxConfiguration(session, path.join(configPaths, './linux'));
        } else {
            throw new Error('Setup script non disponibile per la piattaforma ' + JSON.stringify(session.os));
        }
    } catch (error) {
        logger.error(error);
    }

    if (session) session.disconnect();
};
