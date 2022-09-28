import { Command } from '../../../../types';

const config: Command = {
    description: 'Utility setup certbot VM',
    longHelp: `Installa un certificato SSL tramite certbot (https://certbot.eff.org/) sul target selezionato.
    Il certificato SSL ha validità di tre mesi con renew automatico settimanale
    `,
    exec: './exec',
    params: []
};

export default config;