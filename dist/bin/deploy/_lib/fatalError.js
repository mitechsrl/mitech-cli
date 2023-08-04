"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwOnFatalError = void 0;
const types_1 = require("../../../types");
/**
 * Processa output di deployScript.call per determinare fallimenti
 * @param result output di deployScript.call ((await deployScript.call()).output)
 */
function throwOnFatalError(result) {
    // search and match the generic fatal erro tag error tag
    const fatalErrorMatch = '[FATAL-ERROR]';
    const fatalErrorLine = result.split('\n').find(line => line.indexOf(fatalErrorMatch) >= 0);
    if (fatalErrorLine) {
        throw new types_1.StringError('Deploy fallito');
    }
}
exports.throwOnFatalError = throwOnFatalError;
//# sourceMappingURL=fatalError.js.map