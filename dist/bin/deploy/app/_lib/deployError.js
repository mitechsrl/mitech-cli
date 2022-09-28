"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwOnDeployErrorError = void 0;
async function throwOnDeployErrorError(result) {
    // search and match the deploy error tag
    const deployErrorMatch = '[DEPLOY-ERROR]:';
    let deployErrorLine = result.split('\n').find(line => line.indexOf(deployErrorMatch) >= 0);
    if (deployErrorLine) {
        deployErrorLine = deployErrorLine.substr(deployErrorMatch.length).trim();
        throw new Error('Deploy fallito: ' + deployErrorLine);
    }
}
exports.throwOnDeployErrorError = throwOnDeployErrorError;
//# sourceMappingURL=deployError.js.map