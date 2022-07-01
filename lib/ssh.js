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

const { spawn } = require('child_process');
const path = require('path');
const logger = require('./logger');
const SSHClient = require('ssh2').Client;
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const fs = require('fs');

/**
 * crea una sessione ssh verso un target remoto.
 * NOTA: sessione NON interattiva, solo comandi inviati da programma
 * Ritorna una promise che rigetta o risolve con oggetto del tipo
 * {
 *   command -> Esegue comando e risolve con l'output
 *   disconnect -> disconnette ssh
 *   exec -> oggetto exec raw di ssh2. Vedi https://www.npmjs.com/package/ssh2 per info
 * }
 * @param {*} target {host, port,username,passowrd}

 */
const createSshSession = (target) => {
    logger.log('');
    logger.log('Connessione in corso...');
    return new Promise((resolve, reject) => {
        const conn = new SSHClient();
        conn.on('ready', async function () {
            logger.info('Connesso');

            /**
             * Esegue comando e risolve con l'output
             * @param {*} cmd comando (stringa o array di 'pezzi' poi concatenati con spazio)
             */
            const command = (cmd, print) => {
                let _cmd = cmd;
                if (Array.isArray(cmd)) {
                    _cmd = cmd.join(' ');
                }

                return new Promise((resolve, reject) => {
                    conn.exec(_cmd, {}, function (err, stream) {
                        if (err) return reject(err);

                        let _data = Buffer.from('');
                        stream.on('close', function (code, signal) {
                            return resolve(_data.toString());
                        });
                        stream.on('data', function (data) {
                            _data = Buffer.concat([_data, data]);
                            if (print !== false) { logger.rawLog(data.toString()); }
                        });
                        stream.stderr.on('data', function (data) {
                            _data = Buffer.concat([_data, data]);
                            if (print !== false) { logger.rawLog(data.toString()); }
                        });
                    });
                });
            };

            /**
             * Try to detect the remote OS version
             *
             * return an object like {
                    windows: false,
                    linux: false,
                    version: ''
                };
             */
            const osDetetcor = async () => {
                const result = {
                    windows: false,
                    linux: false,
                    name: '',
                    version: ''
                };

                // windows on powershell.
                try {
                    const cmdResponse = await command('[System.Environment]::OSVersion', false);
                    if (cmdResponse.toLowerCase().indexOf('windows') >= 0) {
                        result.windows = true;
                        const regex = /^.+Windows[^0-9]+([0-9]+).+$/gm;
                        let m;
                        if ((m = regex.exec(cmdResponse)) !== null) {
                            result.version = m[1];
                        }
                        return result;
                    }
                } catch (error) {}

                // windows with cmd
                try {
                    const cmdResponse = await command('ver', false);
                    if (cmdResponse.toLowerCase().indexOf('windows') >= 0) {
                        result.windows = true;
                        const m = cmdResponse.match(/^.+Windows[^0-9]+([0-9]+).+$/g);
                        if (m) {
                            result.version = m[1];
                        }

                        return result;
                    }
                } catch (error) {}

                // linux
                try {
                    const cmdResponse = await command('uname -a', false);
                    result.linux = true;
                    if (cmdResponse.toLowerCase().indexOf('ubuntu') >= 0) {
                        result.name = 'ubuntu';
                    }
                } catch (error) {}

                return result;
            };

            const sessionOs = await osDetetcor();

            /**
             * SU TARGET LINUX: Esegue un comando spacciandosi per un altro utente. Questo comando presuppone
             *                  che l'utente effettivo di esecuzione sia root e quindi in grado di eseguire 'su utente'
             * SU TARGET WINDOWS: equivalente a command
             *
             * @param {*} user chi deve eseguire il comando
             * @param {*} cmd comando (stringa o array di 'pezzi' poi concatenati con spazio)
             */
            const commandAs = (user, cmd, print) => {
                if (sessionOs.linux) {
                    const su = ['sudo su', user, '-c', '"cd; ' + escapeCmd(cmd) + '"'];
                    return command(su, print);
                } else if (sessionOs.windows) {
                    return command(escapeCmd(cmd), print);
                }
                return Promise.reject(new Error('Not implemented for this OS'));
            };

            /**
             * Disconnette la sessione ssh
             */
            const disconnect = () => {
                conn.end();
            };

            /**
             * Upload file.
             * Ritorna una promise che risolve o rigetta.
             *
             * @param {*} localFilename puntamento file locale
             * @param {*} remoteFilename path assoluta file remoto
             */
            const uploadFile = (localFilename, remoteFilename) => {
                return new Promise((resolve, reject) => {
                    conn.sftp(function (err, sftp) {
                        if (err) return reject(err);
                        sftp.fastPut(localFilename, remoteFilename, {}, err => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            };

            /**
             * Download file.
             * Ritorna una promise che risolve o rigetta.
             *
             * @param {*} remoteFilename path assoluta file remoto
             * @param {*} localFilename puntamento file locale
             */
            const downloadFile = (remoteFilename, localFilename) => {
                return new Promise((resolve, reject) => {
                    conn.sftp(function (err, sftp) {
                        if (err) return reject(err);
                        sftp.fastGet(remoteFilename, localFilename, {}, err => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            };

            /**
             * Ottiene la homeDir del sistema remoto.
             * @param {*} nodeUser
             * @param {*} appsContainer Appendi questo path al valore ritornato
             */
            const getRemoteHomeDir = async (nodeUser, appsContainer) => {
                const cmd = escapeCmd("console.log(require('path').join(require('os').homedir(),'" + appsContainer + "'))");
                const hd = await commandAs(nodeUser, 'node -e "' + cmd + '"', false);
                return hd.trim();
            };

            /**
             * Ottiene il path alla cartella temporanea del sistema remoto
             * @param {*} nodeUser
             */
            const getRemoteTmpDir = async (nodeUser) => {
                const cmd = escapeCmd("console.log(require('path').join(require('os').tmpdir(),'./'))");
                const hd = await commandAs(nodeUser, 'node -e "' + cmd + '"', false);
                return hd.trim();
            };

            /**
             * intercetta SIGINT (ctrl+c) per disconnettere ssh in modo normale anzichè brutale
             */
            process.on('SIGINT', () => {
                logger.error('Disconnecting...');
                disconnect();
            });

            resolve({
                target: target,
                os: sessionOs,
                uploadFile: uploadFile, // carica un file locale su server
                downloadFile: downloadFile, // carica un file locale su server
                command: command, // Esegue comando e risolve con l'output
                commandAs: commandAs, // // Esegue comando spacciandosi per un altro utente e risolve con l'output
                disconnect: disconnect, // disconnette ssh
                getRemoteHomeDir: getRemoteHomeDir, // ottiene la home dir remota
                getRemoteTmpDir: getRemoteTmpDir, // ottiene la temp dir remota
                exec: conn.exec // oggetto exec raw. Vedi https://www.npmjs.com/package/ssh2 per info
            });
        });

        conn.on('error', error => reject(error));
        const _t = {
            host: target.host,
            port: target.port,
            username: target.username
        };

        if (target.accessType === 'sshKey') {
            _t.privateKey = fs.readFileSync(target.sshKey);
        } else {
            _t.password = target.password;
        }
        conn.connect(_t);
    });
};
module.exports.createSshSession = createSshSession;

/**
 * Lancia una sessione ssh interattiva. Su windows, viene aperto putty, su altri OS è da implementare.
 * @param {*} target
 */
const interativeClient = (target, params) => {
    const _finalCmd = [];
    let sshExecutableName = 'ssh';
    if (isWindows) {
        _finalCmd.push(target.username + '@' + target.host);

        _finalCmd.push('-P');
        _finalCmd.push(target.port);
        _finalCmd.push(...(params || []));
        if (target.accessType === 'password') {
            _finalCmd.push('-pw');
            _finalCmd.push(target.password);
        } else if (target.accessType === 'sshKey') {
            const ppkFile = target.sshKey + '.ppk';
            if (!fs.existsSync(ppkFile)) {
                spawn(path.join(__dirname, './puttygen.exe'), [target.sshKey]).unref();
                throw new Error('Putty richiede la chiave in formato ppk. Convertila con puttygen e salvala in ' + ppkFile + ', con lo stesso nome ma aggiungi l\'estensione .ppk. Lancio Puttygen in auto, clicca su -save private key-');
            }
            _finalCmd.push('-i');
            _finalCmd.push(ppkFile);
        }

        sshExecutableName = path.join(__dirname, 'putty.exe');
        logger.log('Avvio putty in corso... ');
    } else {
        logger.log('Avvio ssh in corso... ');
    }

    // TODO: verificare pipe VS inherit

    const ssh = spawn(sshExecutableName, _finalCmd, { stdio: 'inherit', detached: isWindows });
    ssh.unref();
};
module.exports.interativeClient = interativeClient;

/**
 * Esegue escaping di un comando doppi abici e backslash per essere usabili innestati in altri comandi
 */
const escapeCmd = (cmd) => {
    let _cmd = (Array.isArray(cmd)) ? cmd.join(' ') : cmd;
    _cmd = _cmd.replace(/\\/g, '\\\\');
    _cmd = _cmd.replace(/"/g, '\\"');
    return _cmd;
};
module.exports.escapeCmd = escapeCmd;
