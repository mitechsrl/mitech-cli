import { GenericObject } from '../../../../types';
/**
 * setup the current git directory
 * @param answers
 */
export declare function initGit(answers: GenericObject): Promise<void>;
/**
 * Setup submodules from user selection
 * @param answers
 */
export declare function initGitSubmodules(answers: GenericObject): Promise<void>;
