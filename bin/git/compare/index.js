/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const logger = require('../../../lib/logger');
const spawn = require('../../../lib/spawn');
const { branchSelector } = require('../_lib/branchSelector');

module.exports.info = 'Compara commit branches';
module.exports.help = [
    'Dato il nome di una branch, compara le commit e mostra le differenze rispetto alla branch corrente',
    ['-b', 'Nome branch da verificare. Opzionale, se non passata viene chiesta via prompt.']
];

module.exports.cmd = async function (basepath, params) {
    const branchName = await branchSelector(params);

    const prettyFormat = '--pretty=format:"%h - %s - %an - %ad"';
    const currentBranchName = (await spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], false)).data.trim();
    const currentBranchLog = (await spawn('git', ['log', prettyFormat, '--date=iso-strict'], false)).data.trim();
    const selectedBranchLog = (await spawn('git', ['log', branchName, prettyFormat, '--date=iso-strict'], false)).data.trim();
    const history = (await spawn('git', ['log', currentBranchName + '...' + branchName, prettyFormat, '--date=iso-strict'], false)).data.trim();

    const historyCommmits = history.split('\n').map(c => c.substring(1, c.length - 1));
    const branchStartingPoint = historyCommmits.pop();
    const currentBranchCommmits = currentBranchLog.split('\n').map(c => c.substring(1, c.length - 1));
    const selectedBranchCommits = selectedBranchLog.split('\n').map(c => c.substring(1, c.length - 1));

    // metto assieme tutte le commit e le ordino per data.
    // Dalla più vecchia aalla più recente
    let allCommits = [...currentBranchCommmits, ...selectedBranchCommits];
    allCommits.sort((a, b) => {
        const aDate = a.split(' ').pop();
        const bDate = b.split(' ').pop();
        if (aDate === bDate) return 0;
        return (aDate < bDate) ? -1 : 1;
    });

    // i doppioni non li devo poi mostrare
    allCommits = allCommits.filter(function (item, pos) {
        return allCommits.indexOf(item) === pos;
    });

    logger.log('');
    logger.info('Legenda:');
    logger.log('C: branch corrente (' + currentBranchName + ')');
    logger.log('S: branch selezionata (' + branchName + ')');
    logger.log('S--C: commit presente in entrambe le branch (da merge)');
    logger.log('S->C: commit presente in branch selezionata ma non quella corrente. Mergiare branch selezionata in corrente');
    logger.log('S<-C: commit presente in branch corrente ma non quella selezionata. Mergiare branch corrente in selezionata');
    logger.log('');

    // processa le righe di commit. La history contiene tutte le commit dall'alba dei tempi, percui nelle bue branch
    // c'è un prima parte in cui esse sono tutte uguali. Inizio a processare le righe quando incontro la prima commit diversa
    // (il che significa alla prima commit dopo l'apertura della branch)
    // Il pezzo prima non è interessante
    let show = false;
    let output = [];
    allCommits.forEach(c => {
        // processa solo le righe dal primo cambiamento in poi
        if (c === branchStartingPoint) {
            show = true;
        }
        if (!show) return;

        // verifica presenza commit in entrambe le branch
        const currentFound = currentBranchCommmits.findIndex(l => l === c);
        const selectedFound = selectedBranchCommits.findIndex(l => l === c);

        // NOTA: l'output lo pusho in un array di callbacks perchè poi devo invertirlo e stamparlo al contrario
        // per avere le commit recenti in alto.
        if (currentFound >= 0 && selectedFound >= 0) {
            // c'è in entrambe le branch
            output.push(() => { logger.log('S--C ' + c); });
        } else if (currentFound >= 0) {
            // c'è nella branch corrente ma non in quella selezionata. E' da portare fuori
            output.push(() => { logger.warn('S<-C ' + c); });
        } else {
            // non c'è nella branch corrente ma c'è in quella selezionata. E' da portare dentro
            output.push(() => { logger.info('S->C ' + c); });
        }
    });

    output = output.reverse();
    output.forEach(f => f());
    logger.log('');
};
