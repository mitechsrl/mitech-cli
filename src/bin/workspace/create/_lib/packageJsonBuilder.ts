import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { GenericObject } from '../../../../types';

/**
 * Creates a workspace package.json file in the current working directory
 * @param answers 
 */
export function packageJsonBuilder(answers: GenericObject){
    
    const packageJson = JSON.parse(readFileSync(join(__dirname,'./templates/package.json')).toString());

    packageJson.name = answers.name,
    packageJson.workspaces = [packageJson.workspaces, ...answers.subpackages.map((s:GenericObject) => s.dir)],

    packageJson.scripts = Object.assign(
        answers.subpackages.reduce((acc: GenericObject, p: GenericObject) => {
            acc['precompile:packages'] += ' precompile:'+p.dir;
            acc['precompile:'+p.dir] = `cd ./${p.dir} && npm run clean && onit serve -t -exit && onit serve -w -exit && cd ../`;
            return acc;
        },
        { 
            'precompile:packages':'run-s',
            'serve': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve`: '',
            'start': answers.mainPackage ?`cd ./${answers.mainPackage.dir} && onit serve`: '',
        }), 
        packageJson.scripts);

    writeFileSync(join(process.cwd(),'package.json'), JSON.stringify(packageJson, null, 4));
}