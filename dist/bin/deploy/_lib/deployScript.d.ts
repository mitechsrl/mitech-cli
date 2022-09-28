import { SshSession } from '../../../lib/ssh';
/**
 * Upload the deploy script and return a helper object to call it.
 *
 * @param {*} session ssh session
 * @param {*} nodeUser User for which script must be run
 * @returns
 *  {call: async ([params], print) => Promise<string>}
 *  call: A proxy function to call the deploy script with the provided parameters.
 *        To know the parameters, see ./_instructions/deploy_instructions.js (at the end of file)
 */
export declare function uploadAndInstallDeployScript(session: SshSession, nodeUser: string): Promise<{
    /**
     * Run the remote deploy script
     * @param {*} args un script parameters
     * @param {*} print Print command output. False by default
     * @returns A promise
     */
    call: (args: string[], print?: boolean) => Promise<import("../../../lib/ssh").SshCommandResult>;
}>;
