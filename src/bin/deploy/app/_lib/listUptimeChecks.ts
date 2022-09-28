import path from 'path';
import fs from 'fs';

export function listUptimeChecks (){
    const files = fs.readdirSync(path.join(__dirname, './uptimeChecks'));
    return files.filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, '')).join(', ');
}
