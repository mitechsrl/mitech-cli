"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function deploy(target, params) {
    var _a, _b;
    const certificate = path_1.default.join(process.cwd(), (_a = params.certificate) !== null && _a !== void 0 ? _a : 'sign-certificate.cer');
    const trustPolicyJson = path_1.default.join(process.cwd(), (_b = params.trustJson) !== null && _b !== void 0 ? _b : 'trustpolicy.json');
    // Ensure file existence
    if (!fs_1.default.existsSync(certificate))
        throw new Error('Certificate file not found');
    if (!fs_1.default.existsSync(trustPolicyJson))
        throw new Error('trust policy json file not found');
    // --store test-kv-1-abb-mitech deve essere uguale a quello definito in trustpolicy.json
    // notation cert add --type ca --store test-kv-1-abb-mitech test-cert-1-acr.cert
    // notation policy import ./trustpolicy.json (deve sovrascrivere config attuale)
}
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map