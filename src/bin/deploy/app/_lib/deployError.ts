export async function throwOnDeployErrorError(result: string){
    // search and match the deploy error tag
    const deployErrorMatch = '[DEPLOY-ERROR]:';
    let deployErrorLine = result.split('\n').find(line => line.indexOf(deployErrorMatch) >= 0);
    if (deployErrorLine) {
        deployErrorLine = deployErrorLine.substr(deployErrorMatch.length).trim();
        throw new Error('Deploy fallito: ' + deployErrorLine);
    }
}
