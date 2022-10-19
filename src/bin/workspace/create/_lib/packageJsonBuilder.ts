import { writeFileSync } from 'fs';
import { join } from 'path';
import { GenericObject } from '../../../../types';

/**
 * Creates a workspace package.json file in the current working directory
 * @param answers 
 */
export function packageJsonBuilder(answers: GenericObject){
    
    const packageJson = {
        name: answers.name,
        workspaces: answers.subpackages.map((s:GenericObject) => s.dir),
        scripts: Object.assign(
            answers.subpackages.reduce((acc: GenericObject, p: GenericObject) => {
                acc['precompile:packages'] += ' precompile:'+p.dir;
                acc['precompile:'+p.dir] = `cd ./${p.dir} && npm run clean && onit serve -t -exit && onit serve -w -exit && cd ../`;
                return acc;
            }, { 'precompile:packages':'run-s' }), 
            {
                'precompile': 'npm run precompile:packages',
                'fetch:all': 'git fetch --recurse-submodules',
                'pull:all': 'git pull --recurse-submodules',
                'boot': 'git submodule init && git submodule update && npm install',
                'serve': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve`: '',
                'start': answers.mainPackage ?`cd ./${answers.mainPackage.dir} && onit serve`: '',
                'uninstall':'node ./node_modules/@mitech/onit-dev-tools/tools/uninstall'
            }),
        dependencies: {
            'npm-run-all': '^4.1.5'
        }
    };
    writeFileSync(join(process.cwd(),'package.json'), JSON.stringify(packageJson, null, 4));
}