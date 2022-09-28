import { SshSession } from '../../../../../lib/ssh';
import { GenericObject, SshTarget } from '../../../../../types';
/**
 * Onit online check. Call the onit status api on the remote target to detect for availability.
 * Also check, with the call result, for expected versions against package.json values
 *
 * NOTE: in case of error, the function must throw an error.
 *
 * @param {*} session ssh session object
 * @param {*} packageJson The pachage json object
 * @param {*} deployResult The output of the deploy script
 * @param {*} target the ssh target server data
 */
export default function onitVersion(session: SshSession, packageJson: GenericObject, deployResult: GenericObject, target: SshTarget): Promise<void>;
