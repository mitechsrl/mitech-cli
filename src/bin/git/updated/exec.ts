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

import inquirer from 'inquirer';
import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { CommandExecFunction, StringError } from '../../../types';
import { prettyFormat } from '../_lib/prettyFormat';

const exec: CommandExecFunction = async () => {
    logger.log('Eseguo git fetch...');

    // faccio fetch per avere info sulle commit in master
    await spawn('git', ['fetch'], false);
    const status = await spawn('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }

    const askTags = [];
    const lastTag = await spawn('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode === 0) && lastTag.output) {
        askTags.push({ name: 'Ultimo ('+lastTag.output.trim()+')', value: lastTag.output.trim() });
    }

    const allTags = await spawn('git', ['tag', '-l'], false);
    allTags.output.split('\n').reverse().forEach(t => {
        askTags.push({
            name: t.trim(),
            value: t.trim()
        });
    });

    if (askTags.length === 0 ){
        throw new StringError('Nessun tag trovato. Impossibile verificare updates');
    }

    const answers = await inquirer.prompt([{
        type:'list',
        name: 'tag',
        message:'Seleziona tag',
        choices: askTags
    }]);

    if (!answers.tag.trim()){
        throw new StringError('Nessun tag selezionato');
    }

    const _count = await spawn('git', ['rev-list', '--count', answers.tag.trim() + '..HEAD'], false);
    const count = parseInt(_count.output.trim());

    logger.info('\nTag: ' + answers.tag.trim() + '\n');
    if (count === 0) {
        logger.log('Non ci sono commit dal tag ' + answers.tag.trim());
    } else {
        logger.warn('Sono state trovate ' + count + ' commit dal tag ' + answers.tag.trim() + '\n');
        const commitsFromTag = await spawn('git', ['log', answers.tag.trim() + '..HEAD', prettyFormat], false);
        commitsFromTag.output.split('\n').forEach(l => {
            const _l = l.trim().substring(1);
            logger.log(_l.substring(0, _l.length-1));
        });
        
    }
};

export default exec;