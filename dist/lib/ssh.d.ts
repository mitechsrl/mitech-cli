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
import { Client, ExecOptions } from 'ssh2';
import { SshTarget } from '../types';
/**
 *
 */
export type SshCommandResult = {
    exitCode: number;
    output: string;
};
/**
 *
 */
export type SshOsDetectorResult = {
    windows: boolean;
    linux: boolean;
    name: string;
    version: string;
};
/**
 *
 */
export declare class SshSession {
    private conn;
    target: SshTarget;
    os: SshOsDetectorResult;
    constructor(conn: Client, target: SshTarget);
    /**
     * Esegue comando e risolve con l'output
     * @param {*} cmd comando (stringa o array di 'pezzi' poi concatenati con spazio)
     */
    command(cmd: string | string[], print?: boolean): Promise<SshCommandResult>;
    /**
     * Try to detect the remote OS version
     * @returns
     */
    osDetetcor(): Promise<SshOsDetectorResult>;
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
    commandAs(user: string, cmd: string | string[], print?: boolean): Promise<SshCommandResult>;
    /**
     * Disconnette la sessione ssh
     */
    disconnect(): void;
    /**
     * Upload file.
     * Ritorna una promise che risolve o rigetta.
     *
     * @param {*} localFilename puntamento file locale
     * @param {*} remoteFilename path assoluta file remoto
     */
    uploadFile(localFilename: string, remoteFilename: string): Promise<unknown>;
    /**
     * Download file.
     * Ritorna una promise che risolve o rigetta.
     *
     * @param {*} remoteFilename path assoluta file remoto
     * @param {*} localFilename puntamento file locale
     */
    downloadFile(remoteFilename: string, localFilename: string): Promise<unknown>;
    /**
     * Ottiene la homeDir del sistema remoto.
     * @param {*} nodeUser
     * @param {*} appsContainer Appendi questo path al valore ritornato
     */
    getRemoteHomeDir(nodeUser: string, appsContainer: string): Promise<string>;
    /**
     * Ottiene il path alla cartella temporanea del sistema remoto
     * @param {*} nodeUser
     */
    getRemoteTmpDir(nodeUser: string): Promise<string>;
    /**
     * Direct ssh exec command
     *
     * @param command
     * @param options
     */
    exec(command: string, options?: ExecOptions): Promise<unknown>;
}
export declare function createSshSession(target: SshTarget): Promise<SshSession>;
/**
 * Lancia una sessione ssh interattiva.
 * @param {*} target
 */
export declare function interativeClient(target: SshTarget, params: string[]): void;
