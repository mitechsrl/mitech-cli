import { SshSession } from '../../../lib/ssh';
/**
 * Upload the deploy script and return a helper object to call it.
 *
 * @param {*} session ssh session
 * @param {*} user User for which script must be run
 * @returns
 *  {call: async ([params], print) => Promise<string>}
 *  call: A proxy function to call the deploy script with the provided parameters.
 *        To know the parameters, see ./_instructions/deploy_instructions.js (at the end of file)
 */
export declare function uploadAndInstallDeployScript(session: SshSession, user: string): Promise<{
    call: (args: string[], print?: boolean) => Promise<import("../../../lib/ssh").SshCommandResult>;
    /**
     * Run remote commands in a dedicated shell.
     * A shell will allow the local cli to replicate colors, line returns and clearscreens like a local shell.
     * @param args
     * @returns
     */
    shellCall: (args: string[]) => Promise<{
        exitCode: number;
    }>;
}>;
