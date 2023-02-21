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
const path_1 = __importDefault(require("path"));
const confirm_1 = require("../../../lib/confirm");
const logger_1 = require("../../../lib/logger");
const mitechCliFile_1 = require("../../../lib/mitechCliFile");
const sound_1 = require("../../../lib/sound");
const targets_1 = require("../../../lib/targets");
const types_1 = require("../../../types");
const deploy_1 = require("../app/_lib/deploy");
const checkDeployment_1 = require("./_lib/checkDeployment");
const mergeDependencies_1 = require("./_lib/mergeDependencies");
const exec = async (argv) => {
    const mitechCliFile = ((0, mitechCliFile_1.getMitechCliFile)() || {});
    if (!mitechCliFile)
        throw new Error('file .mitechCli non trovato');
    const projects = mitechCliFile.content.projects;
    if (!projects || projects.length === 0)
        throw new Error('Nessun progetto definito nel file mitechcli corrente');
    // use the first one as default
    let project = projects[0];
    // or ask if more than one is available
    if (projects.length > 1) {
        const response = await inquirer_1.default.prompt([{
                type: 'list',
                name: 'project',
                message: 'Progetto',
                choices: projects.map((p, index) => ({ name: p.name, value: index }))
            }]);
        project = projects[response.project];
    }
    logger_1.logger.log('Progetto selezionato: ' + project.name);
    // Fake the presence of a parameter if uptimeCheck is defined
    if (project.uptimeCheck) {
        argv.c = project.uptimeCheck;
    }
    const deployments = project.deployments;
    if (!deployments)
        throw new Error('Nessun deployment definito nel progetto selezionato');
    Object.keys(deployments).forEach(k => {
        deployments[k].name = k;
    });
    // ask the user which deployment must be run
    const selectedDeployments = await inquirer_1.default.prompt([{
            type: 'checkbox',
            name: 'deployment',
            message: 'Deployment',
            choices: [
                { name: 'Tutti', value: '$_ALL_$' },
                ...Object.keys(deployments).map((p) => ({ name: p, value: p }))
            ]
        }]);
    let executeDeployments = [];
    if (selectedDeployments.deployment.indexOf('$_ALL_$') >= 0) {
        executeDeployments = Object.values(deployments);
    }
    else {
        selectedDeployments.deployment.forEach((d) => {
            executeDeployments.push(deployments[d]);
        });
    }
    if (executeDeployments.length === 0) {
        throw new Error('No deployment selected');
    }
    // check if deployment ave all the needed data
    const basePath = path_1.default.join(mitechCliFile.file, '../');
    executeDeployments.forEach(d => {
        (0, checkDeployment_1.checkDeployment)(basePath, mitechCliFile.content, d);
    });
    const forceDependencies = argv.f;
    // first pass with false flag, to detect dependencies merge errors.
    // False makes the function not to write the destination package.json.
    if (!forceDependencies) {
        executeDeployments.forEach(d => {
            var _a;
            (0, mergeDependencies_1.mergeDependencies)(basePath, d, (_a = project.commonDependencies) !== null && _a !== void 0 ? _a : {}, false, false);
        });
    }
    // second pass with false true, to also write out the files data.
    // getting here means no errors were detected for any merge in previous steps, so we can write all
    executeDeployments.forEach(d => {
        var _a;
        (0, mergeDependencies_1.mergeDependencies)(basePath, d, (_a = project.commonDependencies) !== null && _a !== void 0 ? _a : {}, true, forceDependencies);
    });
    // iterate over all deployments.
    const originalPath = process.cwd();
    for (const deployment of executeDeployments) {
        try {
            // move the process cwd to the destination dir
            const deploymentCwd = path_1.default.join(process.cwd(), deployment.path);
            // autoselect the target based on the provided id
            let target = mitechCliFile.content.targets.find(t => t.name === deployment.target);
            if (!target)
                throw new types_1.StringError('Target ' + deployment.target + ' not found');
            target = (0, targets_1.decodeTarget)(target);
            // print some info stuff
            const str = `:chicken: Deploy project ${project.name}/${deployment.name}`;
            const lineChar = '─';
            logger_1.logger.warn(lineChar.repeat(str.length));
            logger_1.logger.warn(str);
            logger_1.logger.warn(lineChar.repeat(str.length));
            (0, targets_1.printTarget)(target);
            // run the deploy
            // NOTE: adjust the cwd path to the one of the app folder to keep file references correct.
            // Reset to the base directory
            process.chdir(deploymentCwd);
            const result = await (0, deploy_1.deploy)(target, argv);
            process.chdir(originalPath);
            // deploy was manually aborted.
            if (result.aborted) {
                await (0, sound_1.soundBell)();
                logger_1.logger.info(`Deploy di ${project.name}/${deployment.name} abortito`);
                // this deploy was aborted. Should we continue?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (!await (0, confirm_1.confirm)({}, 'Continuare con i restanti deploy?')) {
                    return;
                }
            }
            // deploy complete
            if (result.complete) {
                await (0, sound_1.soundBell)();
                logger_1.logger.info(`Deploy di ${project.name}/${deployment.name} completato`);
            }
        }
        catch (e) {
            process.chdir(originalPath);
            logger_1.logger.error(`Deploy di ${deployment.name} fallito. Deploy interrotto`);
            throw e;
        }
    }
    logger_1.logger.info('');
    logger_1.logger.info('Deploy project concluso');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map