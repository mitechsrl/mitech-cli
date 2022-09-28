import { SshSession } from '../../../../../../../lib/ssh';
import { GenericObject } from '../../../../../../../types';
declare function command(session: SshSession, answers: GenericObject): Promise<void>;
export default command;
