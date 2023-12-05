"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
async function deploy(target, params) {
    console.log(params);
    // --store test-kv-1-abb-mitech deve essere uguale a quello definito in trustpolicy.json
    // notation cert add --type ca --store test-kv-1-abb-mitech test-cert-1-acr.cert
    // notation policy import ./trustpolicy.json (deve sovrascrivere config attuale)
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map