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
const crypto_1 = __importDefault(require("crypto"));
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
     *
     * @param {*} cmd comando (stringa o array di 'pezzi' poi concatenati con spazio)
     * @param print Stampa su console local l'output del comando in tempo reale. default true
     */
    async command(cmd, print) {
        const _print = print !== false;
        const _cmd = Array.isArray(cmd) ? cmd.join(' ') : cmd;
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
                    if (_print)
                        logger_1.logger.rawLog(data);
                });
                stream.stderr.on('data', function (data) {
                    _data = Buffer.concat([_data, data]);
                    if (_print)
                        logger_1.logger.rawLog(data);
                });
            });
        });
    }
    /**
     * Run sudo apt-get update, then sudo apt-get upgrade
     */
    async updateAndUpgrade() {
        await this.command('sudo apt update');
        await this.command('sudo apt upgrade -y');
    }
    /**
     * Try to detect the remote OS version
     * @returns
     */
    async getOs() {
        if (this.os)
            return this.os;
        this.os = {
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
        catch (error) { /* */ }
        return this.os;
    }
    /**
     * Esegue un comando spacciandosi per un altro utente. Questo comando presuppone
     * che l'utente effettivo di esecuzione sia root e quindi in grado di eseguire 'su utente'
     *
     * @param user The user which must run the command
     * @param cmd Command or array or command parts to be joined with space
     * @param print
     * @returns
     */
    async commandAs(user, cmd, print) {
        const su = ['sudo su', user, '-c', '"cd; ' + escapeCmd(cmd) + '"'];
        return this.command(su, print);
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
     * @param {*} user
     * @param {*} appsContainer Appendi questo path al valore ritornato
     */
    async home(user) {
        const hd = await this.command(`getent passwd ${user} | cut -d: -f6`, false);
        return hd.output.trim();
        /*const cmd = escapeCmd('console.log(require(\'path\').join(require(\'os\').homedir(),\'' + appsContainer + '\'))');
        const hd = await this.commandAs(nodeUser, 'node -e "' + cmd + '"', false);
        return hd.output.trim();*/
    }
    /**
     * Ottiene il path alla cartella temporanea del sistema remoto
     * @param {*} nodeUser
     */
    async tmp() {
        return '/tmp';
        // Tolgo comando via node, supporto solo linux e li è /tmp e fine.
        /*const cmd = escapeCmd('console.log(require(\'path\').join(require(\'os\').tmpdir(),\'./\'))');
        const hd = await this.commandAs(nodeUser, 'node -e "' + cmd + '"', false);
        return hd.output.trim();*/
    }
    /**
     * Genera una nuova shell. La shell è un po limitata, nel senso che è possibile fare poche operazioni, ma
     * supporta tutte le caratteristiche di colorazione, newline e clearscreen, pertanto è estremamente simile
     * ad una shell vera.
     * I comandi che spippolano con l'output ritornando indietro sulla stessa riga funzioneranno correttamente
     * ad esempio i comandi docker di pull, sarano bellini e fighi da vedere.
     *
     * La shell avrà il suo comando exec con cui daoveranno essere eseguiti i comandi. é possibile inoltre switchare
     * utente o directory che questi vengono mantenutoi
     * @param onOpen
     */
    async openShell(onOpen) {
        await new Promise((resolve, reject) => {
            this.conn.shell({
                term: 'xterm-256color',
                height: process.stdout.height,
                width: process.stdout.width
            }, (err, stream) => {
                if (err)
                    return reject(err);
                /*const resizeEvent = () => stream.setWindow(
                    process.stdout.rows,
                    process.stdout.columns,
                    process.stdout.height,
                    process.stdout.width
                );
                process.stdout.on('resize', resizeEvent);
            **/
                const onCloseEvent = ( /*code, signal*/) => {
                    stream.removeAllListeners();
                    // process.stdout.removeListener('resize', resizeEvent);
                    resolve();
                };
                stream.on('close', onCloseEvent);
                async function end() {
                    stream.close();
                }
                function exec(command) {
                    return new Promise(resolve => {
                        // Trucco: con ".shell" non si sa bene quando le cose finiscono perchè 
                        // si interagisce solo tramite uno stream senza eventi ne comandi. PErsapere 
                        // quando un comando finisce, accodo sempre un "echo QUALCOSA"
                        // e poi processo lo stream in ingresso alla ricerca di quell'echo.
                        // Quando lo trovo significa che il comando è finito e posso proseguire.
                        // Ulteriore trucco: ci accodo il codice di uscita per sapere come è andato il comando.
                        const endCommandTag = 'COMMAND-COMPLETED-' + crypto_1.default.createHash('md5').update(command).digest('hex');
                        const endCommandTagMatchRegex = new RegExp(endCommandTag + '-([-0-9]+)$', 'm');
                        const matchEndCommand = (data) => {
                            const match = data.toString().match(endCommandTagMatchRegex);
                            if (match) {
                                stream.stdout.removeListener('data', onData);
                                stream.stderr.removeListener('data', onError);
                                process.stdout.write('\n');
                                resolve({ exitCode: parseInt(match[1]) });
                            }
                        };
                        const onData = (data) => {
                            process.stdout.write(data);
                            matchEndCommand(data);
                        };
                        const onError = (data) => {
                            process.stderr.write(data);
                            matchEndCommand(data);
                        };
                        stream.stdout.on('data', onData);
                        stream.stderr.on('data', onError);
                        stream.write(command + `; echo ${endCommandTag}-$?\n`);
                    });
                }
                const sudoSu = async (user) => {
                    stream.write('sudo su ' + user + '\n');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                };
                onOpen({
                    exec: exec,
                    end: end,
                    sudoSu: sudoSu,
                });
            });
        });
    }
    /**
     * Esegue un comando
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
            // Supportiamo solo linux. 
            // IV: 03-03-2024 Se mi viene chiesto di supportare windows mi licenzio. 
            const os = await session.getOs();
            if (!os.linux) {
                throw new Error('OS non supportato. Questa cli funziona solo su linux, se usi un altro OS verrai decurtato di 15 punti sulla patente.');
            }
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
            username: target.username,
        };
        if (target.accessType === 'sshKey') {
            _t.privateKey = fs_1.default.readFileSync(target.sshKey);
        }
        else {
            // Non è sicuramente piu' EncryptedPassword, è già stata decriptata
            _t.password = target.password;
        }
        conn.connect(_t);
    });
}
exports.createSshSession = createSshSession;
/**
 * Lancia una sessione ssh interattiva.
 * @param {*} target
 */
function interativeClient(target, params) {
    // Su windows non esiste client ssh di default. Per questo ci portiamo dietro il binario di putty
    // e demandiamo tutto a quello.
    if (os_1.default.platform() === 'win32') {
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
                const proc = (0, child_process_1.spawn)(path_1.default.join(__dirname, '../../binaries/putty/puttygen.exe'), [target.sshKey], { detached: true });
                proc.unref();
                throw new Error('Putty richiede la chiave in formato ppk. Convertila con puttygen e salvala in ' + ppkFile + ', con lo stesso nome ma aggiungi l\'estensione .ppk. Lancio Puttygen in auto, clicca su -save private key-');
            }
            finalCmd.push('-i');
            finalCmd.push(ppkFile);
        }
        logger_1.logger.log('Avvio putty in corso... ');
        // TODO: verificare pipe VS inherit
        const ssh = (0, child_process_1.spawn)(path_1.default.join(__dirname, '../../binaries/putty/putty.exe'), finalCmd, { stdio: 'inherit', detached: true });
        ssh.unref();
        return;
    }
    if (fs_1.default.existsSync('/usr/bin/ssh')) {
        // Linux e qualsiasi altro OS unix-based che abbia /usr/bin/ssh
        // Qui implementiamo il solo caso con chiave ssh, perchè non è possibile con /usr/bin/ssh passare la password
        // in chiaro come parametro.  Eventualmente la si risolve con sshpass, ma per ora non voglio far dipendere
        // questo tool da altri (eventualmente il comando sarebbe <sshpass -p  "Your_Server_Password" ssh user@host -p port>)
        // comando con chiave ssh: <ssh username@host -p port -i ssh_cert>
        if (target.accessType === 'sshKey') {
            logger_1.logger.warn('Per uscire, digita \'exit\'');
            const finalCmd = [target.username + '@' + target.host, '-p', target.port.toString(), '-i', target.sshKey];
            // TODO: verificare pipe VS inherit
            const ssh = (0, child_process_1.spawn)('/usr/bin/ssh', finalCmd, { stdio: 'inherit', detached: false });
            ssh.on('close', () => {
                process.exit();
            });
            return;
        }
        throw new Error('Client ssh con credenziali username+password non supportato per questa piattaforma.');
    }
    throw new Error(`Client ssh non implementato per questa piattaforma: ${os_1.default.platform()}`);
}
exports.interativeClient = interativeClient;
//# sourceMappingURL=ssh.js.map