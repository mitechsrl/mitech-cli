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
import path from 'path';
import { logger } from '../../../lib/logger';
import { CommandExecFunction, StringError } from '../../../types';
import { readFileSync, writeFileSync } from 'fs';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {

    const packageJsonToBeUpdate = argv.p as string;
    const dependency = argv.d as string;
    const dependencyVersion = argv.v as string;

    if (!packageJsonToBeUpdate) throw new StringError('Parametro <-p> non specificato. Vedi <-h> per help');
    if (!dependency) throw new StringError('Parametro <-d> non specificato. Vedi <-h> per help');
    if (!dependencyVersion) throw new StringError('Parametro <-dv> non specificato. Vedi <-h> per help');

    const file = path.resolve(process.cwd(), packageJsonToBeUpdate);
    const fileContent = readFileSync(file);
    const json = JSON.parse(fileContent.toString());
    json.dependencies = json.dependencies || {};
    json.dependencies[dependency] = dependencyVersion;
    await writeFileSync(file, JSON.stringify(json, null, 4));

    logger.info('Update completato');
};

export default exec;