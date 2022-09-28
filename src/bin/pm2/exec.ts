import yargs from 'yargs';
import { logger } from '../../lib/logger';
import { createSshSession } from '../../lib/ssh';
import { getTarget, printTarget } from '../../lib/targets';
import { CommandExecFunction } from '../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<{}>) => {

    const target = await getTarget();
    printTarget(target);

    // rimuovi il primo pezzo (pm2)
    const pm2Command = argv._.slice(1).map(p => p.toString());
    if (pm2Command.length === 0) {
        logger.warn('Nessun comando eseguito. Digita <mitech pm2 -h>  per info');
        return;
    }

    const session = await createSshSession(target);
    const nodeUser = target.nodeUser || 'node';
    const pm2 = session.os.windows ? 'pm2.cmd' : 'pm2';
    await session.commandAs(nodeUser, [pm2, ...pm2Command]);
    session.disconnect();
};

export default exec;