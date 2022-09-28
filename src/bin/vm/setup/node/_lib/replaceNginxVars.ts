import { readFileSync } from 'fs';
import { GenericObject } from '../../../../../types';

export function replaceNginxVars(nginxFile: string, answers: GenericObject){
    let file = readFileSync(nginxFile).toString();
    Object.keys(answers).forEach(key => {
        file = file.replace(new RegExp('\\$' + key + '\\$', 'gm'), answers[key]);
    });
    return file;
}
