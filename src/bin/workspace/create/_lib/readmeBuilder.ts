import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { GenericObject } from '../../../../types';
import ejs from 'ejs';

export function readmeBuilder(answers: GenericObject){

    const template = readFileSync(join(__dirname,'./templates/readme.md.ejs')).toString();
    const rendered = ejs.render(template, answers);
    writeFileSync(join(process.cwd(),'README.md'), rendered);
}