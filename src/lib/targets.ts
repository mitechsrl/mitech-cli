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

import yargs from 'yargs';
import inquirer from 'inquirer';
import _ from 'lodash';
import { SshTarget, StringError } from '../types';
import { decrypt } from './crypto';
import { logger } from './logger';
import { getMitechCliFile } from './mitechCliFile';
import path from 'path';

/**
 * DEcode the target password if needed
 * @param {*} target
 */
export function decodeTarget(target: SshTarget) {
    const _t: SshTarget = _.cloneDeep(target);
    // La password va decodificata prima di poterla usare
    if (_t.accessType === 'password') {
        if (typeof _t.password !== 'object') {
            throw new Error('Cannot decrypt password.');
        }
        const encryptionKey = process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || '';
        _t.password = decrypt(_t.password.iv, encryptionKey, _t.password.encryptedData);
    }
    return _t;
}

/**
 * Seleziona un target dal file mitechCLi corrente.
 * NOTA: la funzione autoseleziona l'unico target disponibile se la lista è composta da un solo target
 * @returns
 */
export async function getTarget(argv?: yargs.ArgumentsCamelCase<unknown>) {

    const mitechCliFile = getMitechCliFile();

    logger.info('Uso file: ' + mitechCliFile.file);
    if (mitechCliFile.content.targets.length === 0) {
        throw new StringError('Nessun target disponibile');
    }
    const targets = mitechCliFile.content.targets;

    let _t: SshTarget | undefined;

    if (argv?.target){
        // autoselect con match nome da parametri
        _t = targets.find(target => target.name === argv.target);
        if (!_t) throw new StringError('Target '+argv.target+' non trovato');
    }else if (targets.length === 1) {
        // autoselect unico target disponibile
        _t = targets[0];
    } else {
        // chiedere al bomber davanti al monitor
        const questions = [{
            type: 'list',
            name: 'target',
            message: 'Seleziona target: ',
            choices: targets.map(item => ({ name: item.name, value: item }))
        }];
        const answers = await inquirer.prompt(questions);
        _t = answers.target;
    }

    if (!_t) {
        throw new StringError('Nessun target selezionato');
    }

    // Convert relative ssh keys to absolute. The relative path is referred to .mitechcli file
    // This will solve the incongruence of process.cwd from the mitech cli file location
    if (_t.sshKey && !path.isAbsolute(_t.sshKey)){
        const mitechCliFileDirectory = path.dirname(mitechCliFile.file);
        _t.sshKey = path.resolve(mitechCliFileDirectory, _t.sshKey);
    }
    
    return decodeTarget(_t);
}

/**
 * Stampa il target selezionato
 * 
 * @param {*} target
 */
export function printTarget(target: SshTarget) {
    if (!target) {
        logger.warn('Nessun target correntemente attivo');
        logger.log('Usa <mitech ssh target add> per crearne uno, oppure <mitech ssh target set> per usarne uno già creato');
    } else {
        const separator = '─';
        const targetStrings = [
            ' :arrow_forward:   Nome target: ' + target.name,
            ' :globe_with_meridians:  Hostname/ip: ' + target.host
        ];
        const selectedTarget = 'Target selezionato';
        const l = Math.max(targetStrings[0].length, targetStrings[1].length);
        const l2 = Math.ceil((l - selectedTarget.length) / 2);
        const halfSep = separator.repeat(l2 - 1);

        logger.warn('');
        logger.warn('┌' + halfSep + ' ' + selectedTarget + ' ' + halfSep + '┐');
        logger.warn(targetStrings.join('\n'));
        logger.warn('└' + separator.repeat(2 * l2 + selectedTarget.length) + '┘');
    }
    logger.log('');
}

