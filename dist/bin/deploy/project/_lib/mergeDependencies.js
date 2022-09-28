"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDependencies = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const semver_1 = require("semver");
/**
 *
 * @param {*} basePath
 * @param {*} deployment
 * @param {*} commonDependencies
 * @param {*} writeFile write the package.json file. If false, only eventual merge errors are checked.
 */
function mergeDependencies(basePath, deployment, commonDependencies, writeFile, forceDependencies) {
    const packageJsonPath = path_1.default.join(basePath, deployment.path, 'package.json');
    const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath).toString());
    const finalPackageDeps = packageJson.dependencies || {};
    const _commonDependencies = lodash_1.default.cloneDeep(commonDependencies || {});
    const specificDependencies = deployment.dependencies || {};
    Object.entries(specificDependencies).forEach(e => {
        const depName = e[0];
        const depVersion = e[1];
        _commonDependencies[depName] = depVersion;
    });
    Object.entries(_commonDependencies).forEach(e => {
        const commonDepName = e[0];
        const commonDepVersion = e[1];
        // dependency set is forced. Do not apply any check.
        if (forceDependencies) {
            finalPackageDeps[commonDepName] = commonDepVersion;
            return;
        }
        if (!finalPackageDeps[commonDepName]) {
            // this dep is not declared. Just add it.
            finalPackageDeps[commonDepName] = commonDepVersion;
        }
        else {
            // ok only if the version specified by destination package.json is less or equal the version specified in
            // the common dependencies
            const _tmp1 = (0, semver_1.minVersion)(commonDepVersion); // affanq null
            const _tmp2 = (0, semver_1.minVersion)(finalPackageDeps[commonDepName]); // affanq null
            const commonIsEqualOrBigger = _tmp1.compareMain(_tmp2) >= 0;
            if (commonIsEqualOrBigger) {
                finalPackageDeps[commonDepName] = commonDepVersion;
            }
            else {
                throw new Error(`Errore: il file ${packageJsonPath} dichiara la dipendenza ${commonDepName} a versione maggiore rispetto quella delle dipendenze comuni.\nDipendenza comune: ${commonDepVersion}, package.json: ${finalPackageDeps[commonDepName]}`);
            }
        }
    });
    if (writeFile) {
        packageJson.dependencies = finalPackageDeps;
        (0, fs_1.writeFileSync)(packageJsonPath, JSON.stringify(packageJson, null, 4));
    }
}
exports.mergeDependencies = mergeDependencies;
//# sourceMappingURL=mergeDependencies.js.map