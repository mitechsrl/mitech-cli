"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Carica "sign-certificate.cer" e "trustpolicy.json" su server per verifica firma immagini docker',
    exec: './exec',
    params: [{
            name: 'j',
            config: {
                alias: 'trust-json',
                type: 'string',
                description: 'Nome file json trust policy. Default "trustpolicy.json"'
            },
        }, {
            name: 'c',
            config: {
                alias: 'certificate',
                type: 'string',
                description: 'Nome file certificato. Default "sign-certificate.cer"'
            },
        },]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map