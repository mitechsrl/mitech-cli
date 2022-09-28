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
import path from 'path';
import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { getMitechCliFile } from '../../../lib/mitechCliFile';
import { decodeTarget, printTarget } from '../../../lib/targets';
import { CommandExecFunction, MitechCliFileContentProjectDeployment, StringError } from '../../../types';
import { deploy } from '../app/_lib/deploy';
import { checkDeployment } from './_lib/checkDeployment';
import { mergeDependencies } from './_lib/mergeDependencies';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const mitechCliFile = (getMitechCliFile() || {});
    if (!mitechCliFile) throw new Error('file .mitechCli non trovato');

    const projects = mitechCliFile.content.projects;
    if (!projects || projects.length === 0) throw new Error('Nessun progetto definito nel file mitechcli corrente');

    // use the first one as default
    let project = projects[0];
    // or ask if more than one is available
    if (projects.length > 1) {
        const response = await inquirer.prompt([{
            type: 'list',
            name: 'project',
            message: 'Progetto',
            choices: projects.map((p, index) => ({ name: p.name, value: index }))
        }]);
        project = projects[response.project];
    }
    logger.log('Progetto selezionato: ' + project.name);

    // Fake the presence of a parameter if uptimeCheck is defined
    if (project.uptimeCheck) {
        argv.c = project.uptimeCheck;
    }

    const deployments = project.deployments;
    if (!deployments) throw new Error('Nessun deployment definito nel progetto selezionato');
    Object.keys(deployments).forEach(k => {
        deployments[k].name = k;
    });

    // ask the user which deployment must be run
    const selectedDeployments = await inquirer.prompt([{
        type: 'checkbox',
        name: 'deployment',
        message: 'Deployment',
        choices: [
            { name: 'Tutti', value: '$_ALL_$' },
            ...Object.keys(deployments).map((p) => ({ name: p, value: p }))
        ]
    }]);

    let executeDeployments: MitechCliFileContentProjectDeployment[]= [];
    if (selectedDeployments.deployment.indexOf('$_ALL_$') >= 0) {
        executeDeployments = Object.values(deployments);
    } else {
        selectedDeployments.deployment.forEach((d:string) => {
            executeDeployments.push(deployments[d]);
        });
    }

    if (executeDeployments.length === 0) {
        throw new Error('No deployment selected');
    }
    // check if deployment ave all the needed data
    const basePath = path.join(mitechCliFile.file, '../');
    executeDeployments.forEach(d => {
        checkDeployment(basePath, mitechCliFile.content, d);
    });

    const forceDependencies = argv.f as boolean;
    // first pass with false flag, to detect dependencies merge errors.
    // False makes the function not to write the destination package.json.
    if (!forceDependencies) {
        executeDeployments.forEach(d => {
            mergeDependencies(basePath, d, project.commonDependencies ?? {}, false, false);
        });
    }

    // second pass with false true, to also write out the files data.
    // getting here means no errors were detected for any merge in previous steps, so we can write all
    executeDeployments.forEach(d => {
        mergeDependencies(basePath, d, project.commonDependencies ?? {}, true, forceDependencies);
    });

    // iterate over all deployments.
    const originalPath = process.cwd();
    for (const deployment of executeDeployments) {
        try {
            // move the process cwd to the destination dir
            const deploymentCwd = path.join(process.cwd(), deployment.path);

            // autoselect the target based on the provided id
            let target = mitechCliFile.content.targets.find(t => t.name === deployment.target);
            if (!target) throw new StringError('Target '+deployment.target+' not found');
            target = decodeTarget(target);

            // print some info stuff
            const str = `:chicken: Deploy project ${project.name}/${deployment.name}`;
            const lineChar = '─';
            logger.warn(lineChar.repeat(str.length));
            logger.warn(str);
            logger.warn(lineChar.repeat(str.length));

            printTarget(target);

            // run the deploy
            // NOTE: adjust the cwd path to the one of the app folder to keep file references correct.
            // Reset to the base directory

            process.chdir(deploymentCwd);
            const result = await deploy(target, argv);
            process.chdir(originalPath);

            // deploy was manually aborted.
            if (result.aborted) {
                logger.info(`Deploy di ${project.name}/${deployment.name} abortito`);

                // this deploy was aborted. Should we continue?
                const response = await inquirer.prompt({
                    type: 'confirm',
                    name: 'yes',
                    message: 'Continuare con i restanti deploy?'
                });
                if (!response.yes) { return; }
            }

            // deploy complete
            if (result.complete) {
                logger.info(`Deploy di ${project.name}/${deployment.name} completato`);
            }
        } catch (e) {
            process.chdir(originalPath);
            logger.error(`Deploy di ${deployment.name} fallito. Deploy interrotto`);
            throw e;
        }
    }
    logger.info('');
    logger.info('Deploy project concluso');
};

export default exec;