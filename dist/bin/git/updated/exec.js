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
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../../../lib/logger");
const spawn_1 = require("../../../lib/spawn");
const types_1 = require("../../../types");
const prettyFormat_1 = require("../_lib/prettyFormat");
const exec = async () => {
    logger_1.logger.log('Autofetch...');
    // faccio fetch per avere info sulle commit in master
    await (0, spawn_1.spawn)('git', ['fetch'], false);
    const status = await (0, spawn_1.spawn)('git', ['status'], false);
    if (status.output.indexOf('is behind') >= 0) {
        logger_1.logger.warn('Esistono commit non pullate sulla branch corrente. Fai git pull e riesegui il comando.');
    }
    const askTags = [];
    const lastTag = await (0, spawn_1.spawn)('git', ['describe', '--tags', '--abbrev=0'], false);
    if ((lastTag.exitCode === 0) && lastTag.output) {
        askTags.push({ name: 'Ultimo (' + lastTag.output.trim() + ')', value: lastTag.output.trim() });
    }
    const allTags = await (0, spawn_1.spawn)('git', ['tag', '-l'], false);
    allTags.output.split('\n').reverse().forEach(t => {
        askTags.push({
            name: t.trim(),
            value: t.trim()
        });
    });
    if (askTags.length === 0) {
        throw new types_1.StringError('Nessun tag trovato. Impossibile verificare updates');
    }
    const answers = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'tag',
            message: 'Seleziona tag',
            choices: askTags
        }]);
    if (!answers.tag.trim()) {
        throw new types_1.StringError('Nessun tag selezionato');
    }
    const _count = await (0, spawn_1.spawn)('git', ['rev-list', '--count', answers.tag.trim() + '..HEAD'], false);
    const count = parseInt(_count.output.trim());
    logger_1.logger.info('\nTag: ' + answers.tag.trim() + '\n');
    if (count === 0) {
        logger_1.logger.log('Non ci sono commit dal tag ' + answers.tag.trim());
    }
    else {
        logger_1.logger.warn('Sono state trovate ' + count + ' commit dal tag ' + answers.tag.trim() + '\n');
        const commitsFromTag = await (0, spawn_1.spawn)('git', ['log', answers.tag.trim() + '..HEAD', prettyFormat_1.prettyFormat], false);
        commitsFromTag.output.split('\n').forEach(l => {
            const _l = l.trim().substring(1);
            logger_1.logger.log(_l.substring(0, _l.length - 1));
        });
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map