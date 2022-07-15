const path = require('path');
const fs = require('fs');

module.exports.checkDeployment = (basePath, mitechCliFileContent, deployment) => {
    /* {
        "target":"id-dab"
        "path":"./dab/onit-next"
    } */

    const packageJsonPath = path.join(basePath, deployment.path, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error(`File ${packageJsonPath} not found`);
    }
    // this throws in case of errors
    JSON.parse(fs.readFileSync(packageJsonPath).toString());

    if (!deployment.target) {
        throw new Error(`No target defined for deployment ${deployment.name}.`);
    }

    if (!mitechCliFileContent.targets.find(t => t.name === deployment.target)) {
        throw new Error(`Target ${deployment.target} does not exist. Please change your id in .mitechcli file`);
    }
};
