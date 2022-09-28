import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { GenericObject } from '../../../../types';
import _ from 'lodash';
import { SemVer, minVersion } from 'semver';

/**
 *
 * @param {*} basePath
 * @param {*} deployment
 * @param {*} commonDependencies
 * @param {*} writeFile write the package.json file. If false, only eventual merge errors are checked.
 */
export function mergeDependencies(
    basePath:string, 
    deployment: GenericObject, 
    commonDependencies: GenericObject,
    writeFile:boolean,
    forceDependencies: boolean){

    const packageJsonPath = path.join(basePath, deployment.path, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());

    const finalPackageDeps = packageJson.dependencies || {};
    const _commonDependencies = _.cloneDeep(commonDependencies || {});
    const specificDependencies = deployment.dependencies || {};

    Object.entries(specificDependencies).forEach(e => {
        const depName = e[0];
        const depVersion = e[1];
        _commonDependencies[depName] = depVersion;
    });
    Object.entries(_commonDependencies).forEach(e => {
        const commonDepName = e[0];
        const commonDepVersion = e[1] as string;

        // dependency set is forced. Do not apply any check.
        if (forceDependencies) {
            finalPackageDeps[commonDepName] = commonDepVersion;
            return;
        }

        if (!finalPackageDeps[commonDepName]) {
            // this dep is not declared. Just add it.
            finalPackageDeps[commonDepName] = commonDepVersion;
        } else {
            // ok only if the version specified by destination package.json is less or equal the version specified in
            // the common dependencies
            const _tmp1 = minVersion(commonDepVersion) as SemVer; // affanq null
            const _tmp2 = minVersion(finalPackageDeps[commonDepName]) as SemVer; // affanq null
            const commonIsEqualOrBigger = _tmp1.compareMain(_tmp2) >= 0;

            if (commonIsEqualOrBigger) {
                finalPackageDeps[commonDepName] = commonDepVersion;
            } else {
                throw new Error(`Errore: il file ${packageJsonPath} dichiara la dipendenza ${commonDepName} a versione maggiore rispetto quella delle dipendenze comuni.\nDipendenza comune: ${commonDepVersion}, package.json: ${finalPackageDeps[commonDepName]}`);
            }
        }
    });

    if (writeFile) {
        packageJson.dependencies = finalPackageDeps;
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
    }
}
