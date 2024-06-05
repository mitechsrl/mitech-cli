import { MitechCliFileContentStepCommand } from '../types';
/**
 *
 * @param title
 * @param commands
 */
export declare function askAndRunCommands(title: string, commands?: MitechCliFileContentStepCommand[]): Promise<void>;
export declare function commandRunner(command: MitechCliFileContentStepCommand): Promise<number>;
