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

    if (!deployment.targetId) {
        throw new Error(`No targetId defined for deployment ${deployment.name}.`);
    }

    if (!mitechCliFileContent.targets.find(t => t.id === deployment.targetId)) {
        throw new Error(`Target ${deployment.targetId} does not exist. Please change your id in .mitechcli file`);
    }
};
