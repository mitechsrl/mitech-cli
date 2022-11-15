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
exports.interativeClient = exports.createSshSession = exports.SshSession = void 0;
const ssh2_1 = require("ssh2");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
const os_1 = __importDefault(require("os"));
/**
 * Esegue escaping di un comando doppi abici e backslash per essere usabili innestati in altri comandi
 */
function escapeCmd(cmd) {
    let _cmd = (Array.isArray(cmd)) ? cmd.join(' ') : cmd;
    _cmd = _cmd.replace(/\\/g, '\\\\');
    _cmd = _cmd.replace(/"/g, '\\"');
    return _cmd;
}
/**
 *
 */
class SshSession {
    constructor(conn, target) {
        this.target = target;
        this.conn = conn;
    }
    /**
     * Esegue comando e risolve con l'output
     * @param {*} cmd comando (stringa o array di 'pezzi' poi concatenati con spazio)
     */
    async command(cmd, print) {
        let _cmd;
        if (Array.isArray(cmd)) {
            _cmd = cmd.join(' ');
        }
        else {
            _cmd = cmd;
        }
        return new Promise((resolve, reject) => {
            this.conn.exec(_cmd, {}, function (err, stream) {
                if (err)
                    return reject(err);
                let _data = Buffer.from('');
                stream.on('close', function (code) {
                    return resolve({
                        exitCode: code,
                        output: _data.toString()
                    });
                });
                stream.on('data', function (data) {
                    _data = Buffer.concat([_data, data]);
                    if (print !== false) {
                        logger_1.logger.rawLog(data.toString());
                    }
                });
                stream.stderr.on('data', function (data) {
                    _data = Buffer.concat([_data, data]);
                    if (print !== false) {
                        logger_1.logger.rawLog(data.toString());
                    }
                });
            });
        });
    }
    /**
     * Try to detect the remote OS version
     * @returns
     */
    async osDetetcor() {
        if (this.os)
            return this.os;
        this.os = {
            windows: false,
            linux: false,
            name: '',
            version: ''
        };
        // linux
        try {
            const cmdResponse = await this.command('uname -a', false);
            if (cmdResponse.exitCode === 0) {
                const lsbRelease = await this.command('lsb_release -a', false);
                if (cmdResponse.output.toLowerCase().indexOf('linux') >= 0) {
                    this.os.linux = true;
                }
                if (cmdResponse.output.toLowerCase().indexOf('ubuntu') >= 0) {
                    this.os.name = 'ubuntu';
                }
                const regex = /Description:[^\w]+(.*)/gm;
                const e = regex.exec(lsbRelease.output);
                if (e && e[1]) {
                    this.os.version = e[1];
                }
                return this.os;
            }
        }
        catch (error) { }
        // windows on powershell.
        try {
            const cmdResponse = await this.command('[System.Environment]::OSVersion', false);
            if (cmdResponse.exitCode === 0) {
                if (cmdResponse.output.toLowerCase().indexOf('windows') >= 0) {
                    this.os.windows = true;
                    const regex = /^.+Windows[^0-9]+([0-9]+).+$/gm;
                    let m;
                    if ((m = regex.exec(cmdResponse.output)) !== null) {
                        this.os.version = m[1];
                    }
                    return this.os;
                }
            }
        }
        catch (error) { }
        // windows with cmd
        try {
            const cmdResponse = await this.command('ver', false);
            if (cmdResponse.exitCode === 0) {
                if (cmdResponse.output.toLowerCase().indexOf('windows') >= 0) {
                    this.os.windows = true;
                    const m = cmdResponse.output.match(/^.+Windows[^0-9]+([0-9]+).+$/g);
                    if (m) {
                        this.os.version = m[1];
                    }
                    return this.os;
                }
            }
        }
        catch (error) { }
        return this.os;
    }
    /**
     * /**
     * SU TARGET LINUX: Esegue un comando spacciandosi per un altro utente. Questo comando presuppone
     *                  che l'utente effettivo di esecuzione sia root e quindi in grado di eseguire 'su utente'
     * SU TARGET WINDOWS: equivalente a command
     *
     * @param user The user which must run the command
     * @param cmd Command or array or command parts to be joined with space
     * @param print
     * @returns
     */
    async commandAs(user, cmd, print) {
        if (this.os.linux) {
            const su = ['sudo su', user, '-c', '"cd; ' + escapeCmd(cmd) + '"'];
            return this.command(su, print);
        }
        else if (this.os.windows) {
            return this.command(escapeCmd(cmd), print);
        }
        return Promise.reject(new Error('Not implemented for this OS'));
    }
    /**
     * Disconnette la sessione ssh
     */
    disconnect() {
        this.conn.end();
    }
    /**
     * Upload file.
     * Ritorna una promise che risolve o rigetta.
     *
     * @param {*} localFilename puntamento file locale
     * @param {*} remoteFilename path assoluta file remoto
     */
    async uploadFile(localFilename, remoteFilename) {
        return new Promise((resolve, reject) => {
            this.conn.sftp(function (err, sftp) {
                if (err)
                    return reject(err);
                sftp.fastPut(localFilename, remoteFilename, {}, err => {
                    if (err)
                        return reject(err);
                    resolve(null);
                });
            });
        });
    }
    /**
     * Download file.
     * Ritorna una promise che risolve o rigetta.
     *
     * @param {*} remoteFilename path assoluta file remoto
     * @param {*} localFilename puntamento file locale
     */
    async downloadFile(remoteFilename, localFilename) {
        return new Promise((resolve, reject) => {
            this.conn.sftp(function (err, sftp) {
                if (err)
                    return reject(err);
                sftp.fastGet(remoteFilename, localFilename, {}, err => {
                    if (err)
                        return reject(err);
                    resolve(null);
                });
            });
        });
    }
    /**
     * Ottiene la homeDir del sistema remoto.
     * @param {*} nodeUser
     * @param {*} appsContainer Appendi questo path al valore ritornato
     */
    async getRemoteHomeDir(nodeUser, appsContainer) {
        const cmd = escapeCmd('console.log(require(\'path\').join(require(\'os\').homedir(),\'' + appsContainer + '\'))');
        const hd = await this.commandAs(nodeUser, 'node -e "' + cmd + '"', false);
        return hd.output.trim();
    }
    /**
     * Ottiene il path alla cartella temporanea del sistema remoto
     * @param {*} nodeUser
     */
    async getRemoteTmpDir(nodeUser) {
        const cmd = escapeCmd('console.log(require(\'path\').join(require(\'os\').tmpdir(),\'./\'))');
        const hd = await this.commandAs(nodeUser, 'node -e "' + cmd + '"', false);
        return hd.output.trim();
    }
    /**
     * Direct ssh exec command
     *
     * @param command
     * @param options
     */
    async exec(command, options) {
        return new Promise((resolve, reject) => {
            this.conn.exec(command, options !== null && options !== void 0 ? options : {}, (err, result) => {
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    }
}
exports.SshSession = SshSession;
async function createSshSession(target) {
    logger_1.logger.log('');
    logger_1.logger.log('Connessione in corso...');
    return new Promise((resolve, reject) => {
        const conn = new ssh2_1.Client();
        conn.on('ready', async function () {
            const session = new SshSession(conn, target);
            await session.osDetetcor();
            // intercetta SIGINT (ctrl+c) per disconnettere ssh in modo normale anzichè brutale
            process.on('SIGINT', () => {
                logger_1.logger.error('Disconnecting...');
                session.disconnect();
            });
            resolve(session);
        });
        // reject on connection error
        conn.on('error', error => reject(error));
        const _t = {
            host: target.host,
            port: target.port,
            username: target.username
        };
        if (target.accessType === 'sshKey') {
            _t.privateKey = fs_1.default.readFileSync(target.sshKey);
        }
        else {
            _t.password = target.password;
        }
        conn.connect(_t);
    });
}
exports.createSshSession = createSshSession;
/**
 * Lancia una sessione ssh interattiva. Su windows, viene aperto putty, su altri OS è da implementare.
 * @param {*} target
 */
function interativeClient(target, params) {
    const isWindows = os_1.default.platform() === 'win32';
    const isLinux = os_1.default.platform() === 'linux';
    if (isWindows) {
        const finalCmd = [];
        // prepare putty command
        finalCmd.push(target.username + '@' + target.host);
        finalCmd.push('-P');
        finalCmd.push(target.port.toString());
        finalCmd.push(...(params || []));
        if (target.accessType === 'password') {
            finalCmd.push('-pw');
            finalCmd.push(target.password.toString());
        }
        else if (target.accessType === 'sshKey') {
            const ppkFile = target.sshKey + '.ppk';
            if (!fs_1.default.existsSync(ppkFile)) {
                (0, child_process_1.spawn)(path_1.default.join(__dirname, '../../putty/puttygen.exe'), [target.sshKey]).unref();
                throw new Error('Putty richiede la chiave in formato ppk. Convertila con puttygen e salvala in ' + ppkFile + ', con lo stesso nome ma aggiungi l\'estensione .ppk. Lancio Puttygen in auto, clicca su -save private key-');
            }
            finalCmd.push('-i');
            finalCmd.push(ppkFile);
        }
        logger_1.logger.log('Avvio putty in corso... ');
        // TODO: verificare pipe VS inherit
        const ssh = (0, child_process_1.spawn)(path_1.default.join(__dirname, '../../putty/putty.exe'), finalCmd, { stdio: 'inherit', detached: true });
        ssh.unref();
        return;
    }
    if (isLinux) {
        // con chiave ssh
        // ssh username@host -p port -i ssh_cert
        if (target.accessType === 'sshKey') {
            logger_1.logger.warn('Per uscire, digita \'exit\'');
            const finalCmd = [target.username + '@' + target.host, '-p', target.port.toString(), '-i', target.sshKey];
            // TODO: verificare pipe VS inherit
            const ssh = (0, child_process_1.spawn)('ssh', finalCmd, { stdio: 'inherit', detached: false });
            ssh.on('close', () => {
                process.exit();
            });
            return;
        }
        // con password: occorre sshpass, ma non voglio forzare l'utente a installare tool esterni!
        // sshpass -p  "Your_Server_Password" ssh user@host -p port
        throw new Error('Client ssh con credenzialu username+password non supportato su linux.');
    }
    throw new Error('Implementare client ssh per questa piattaforma!');
}
exports.interativeClient = interativeClient;
//# sourceMappingURL=ssh.js.map