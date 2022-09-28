import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';
declare function command(session: SshSession, answers: GenericObject): Promise<import("../../../../../../../lib/ssh").SshCommandResult>;
export default command;
