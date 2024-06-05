import inquirer from 'inquirer';
import { GenericObject, MitechCliFile, MitechCliFileContentStepCommand } from '../types';
import { logger } from './logger';
import { spawn } from './spawn';

/**
 * 
 * @param title 
 * @param commands 
 */
export async function askAndRunCommands(title:string, commands?: MitechCliFileContentStepCommand[]){
    let _commands = commands ?? [];

    if (_commands.length > 0) {
        logger.log(title);
        const list = _commands.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: step.name
        }));
        const answers = await inquirer.prompt(list);
        _commands = _commands.filter((step, index) => answers['step_' + index]);

        for (const step of _commands) {
            await commandRunner(step);
        }
    }
}

export async function commandRunner(command: MitechCliFileContentStepCommand){
    logger.log('Running <' + command.name + '>...');

    // change cwd if needed
    let originalCwd = null;
    if (command.cwd) {
        originalCwd = process.cwd();
        process.chdir(command.cwd);
    }

    if (command.cmd) {
        if (!Array.isArray(command.cmd)) {
            command.cmd = [command.cmd];
        }
        // const cmd = Array.isArray(step.cmd) ? step.cmd[0] : step.cmd;
        // const params = (Array.isArray(step.cmd) && (step.cmd.length > 1)) ? [step.cmd[1]] : [];
        for (const cmd of command.cmd) {
            logger.log('Running <' + cmd + '>');
            const result = await spawn(cmd, [], true, {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,
                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd(),
                // Inherith stdio from the current process, we don't need to process the output
                stdio: ['ignore','inherit','inherit']
            } as GenericObject);

            if (result.exitCode !== 0) {
                throw new Error('Command failed. Exit code: ' + result.exitCode);
            }
        }
    }

    if (originalCwd) {
        process.chdir(originalCwd);
    }

    logger.log(':white_check_mark: Step <' + command.name + '> completed!');
    return 0;
}