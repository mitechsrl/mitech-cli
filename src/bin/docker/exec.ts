import yargs from 'yargs';
import { logger } from '../../lib/logger';
import { createSshSession } from '../../lib/ssh';
import { getTarget, printTarget } from '../../lib/targets';
import { CommandExecFunction } from '../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    const target = await getTarget();
    printTarget(target);

    // rimuovi il primo pezzo (docker)
    const command = argv._.slice(1).map(p => p.toString());
    if (command.length === 0) {
        logger.warn('Nessun comando eseguito. Digita <mitech docker -h>  per info');
        return;
    }

    const session = await createSshSession(target);
    const appUser = target.nodeUser || 'onit';
    await session.commandAs(appUser, ['sudo', 'docker', ...command]);
    session.disconnect();
};

export default exec;