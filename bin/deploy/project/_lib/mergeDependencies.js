const path = require('path');
const fs = require('fs');
const semver = require('semver');
const _ = require('lodash');

/**
 *
 * @param {*} basePath
 * @param {*} deployment
 * @param {*} commonDependencies
 * @param {*} writeFile write the package.json file. If false, only eventual merge errors are checked.
 */
module.exports.mergeDependencies = (basePath, deployment, commonDependencies, writeFile) => {
    const packageJsonPath = path.join(basePath, deployment.path, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    const deps = packageJson.dependencies || {};

    const _commonDependencies = _.cloneDeep(commonDependencies || {});

    const specificDependencies = deployment.dependencies || {};

    Object.entries(specificDependencies).forEach(e => {
        const depName = e[0];
        const depVersion = e[1];
        _commonDependencies[depName] = depVersion;
    });
    Object.entries(_commonDependencies).forEach(e => {
        const depName = e[0];
        const depVersion = e[1];

        if (!deps[depName]) {
            deps[depName] = depVersion;
        } else if (semver.lte(deps[depName], depVersion)) {
            deps[depName] = depVersion;
        } else {
            throw new Error(`Errore: il file ${packageJsonPath} dichiara la dipendenza ${depName} a versione maggiore rispetto quella delle dipendenze comuni.\nDipendenza comune: ${depVersion}, package.json: ${deps[depName]}`);
        }
    });

    if (writeFile) {
        packageJson.dependencies = deps;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
    }
};
