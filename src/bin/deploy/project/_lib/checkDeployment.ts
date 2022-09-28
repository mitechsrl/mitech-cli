import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { GenericObject, MitechCliFileContent, StringError } from '../../../../types';

/**
 * Deployment check function. Just check values and throw on error.
 * 
 * @param basePath 
 * @param mitechCliFileContent 
 * @param deployment 
 */
export function checkDeployment(basePath:string, mitechCliFileContent: MitechCliFileContent, deployment: GenericObject){
    /* {
        "target":"id-dab"
        "path":"./dab/onit-next"
    } */

    const packageJsonPath = path.join(basePath, deployment.path, 'package.json');
    if (!existsSync(packageJsonPath)) {
        throw new StringError(`File ${packageJsonPath} not found`);
    }
    // this throws in case of errors
    JSON.parse(readFileSync(packageJsonPath).toString());

    if (!deployment.target) {
        throw new StringError(`No target defined for deployment ${deployment.name}.`);
    }

    if (!mitechCliFileContent.targets.find(t => t.name === deployment.target)) {
        throw new StringError(`Target ${deployment.target} does not exist. Please change target name in .mitechcli file`);
    }
}
