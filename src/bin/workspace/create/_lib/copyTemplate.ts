import fs from 'fs';
import { join, dirname } from 'path';
import { GenericObject } from '../../../../types';
import ejs from 'ejs';

import glob from 'glob';
import util from 'util';

/**
 * Render and copy all the ./template files, except some one that are managed manually
 * @param answers 
 */
export async function copyTemplate(answers: GenericObject){

    const promiseGlob = util.promisify(glob);
    const templatePath = join(__dirname,'./templates');
    // search all files in template
    const files = await promiseGlob('./**/*', { dot:true, cwd: templatePath });
    
    const excludeFiels = ['package.json'];

    // render and save out all the found files.
    // Package.json is omitted since is managed by other code
    for (const file of files){
        // do not process some files
        if (excludeFiels.includes(file)) continue;

        const template = fs.readFileSync(join(templatePath, file)).toString();
        const rendered = ejs.render(template, answers);
        const finalFileName = join(process.cwd(),file.replace('.ejs',''));

        const dir = dirname(finalFileName);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive:true });
        }
        
        fs.writeFileSync(finalFileName, rendered);
    }
}