import yargs from 'yargs';
import { SshTarget } from '../../../../types';
export declare function deploy(target: SshTarget, params: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
