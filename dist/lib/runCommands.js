"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandRunner = exports.askAndRunCommands = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("./logger");
const spawn_1 = require("./spawn");
/**
 *
 * @param title
 * @param commands
 */
async function askAndRunCommands(title, commands) {
    let _commands = commands !== null && commands !== void 0 ? commands : [];
    if (_commands.length > 0) {
        logger_1.logger.log(title);
        const list = _commands.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: step.name
        }));
        const answers = await inquirer_1.default.prompt(list);
        _commands = _commands.filter((step, index) => answers['step_' + index]);
        for (const step of _commands) {
            await commandRunner(step);
        }
    }
}
exports.askAndRunCommands = askAndRunCommands;
async function commandRunner(command) {
    logger_1.logger.log('Running <' + command.name + '>...');
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
            logger_1.logger.log('Running <' + cmd + '>');
            const result = await (0, spawn_1.spawn)(cmd, [], true, {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,
                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd(),
                // Inherith stdio from the current process, we don't need to process the output
                stdio: ['ignore', 'inherit', 'inherit']
            });
            if (result.exitCode !== 0) {
                throw new Error('Command failed. Exit code: ' + result.exitCode);
            }
        }
    }
    if (originalCwd) {
        process.chdir(originalCwd);
    }
    logger_1.logger.log(':white_check_mark: Step <' + command.name + '> completed!');
    return 0;
}
exports.commandRunner = commandRunner;
//# sourceMappingURL=runCommands.js.map