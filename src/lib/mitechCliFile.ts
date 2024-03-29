/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

import fs from 'fs';
import path from 'path';
import { GenericObject, MitechCliFile, StringError } from '../types';

/*
Example of mitechcli file
{
    "projects":[{ // optional
        "name": "onit-next"
        "commonDependencies": {}, // stesso formato del package.json
        "deployments":{   // selezione multipla con anche "tutti"
            "deployment1": {
                    "target":"id-target1", //target ssh
                    "dependencies":{} // stesso formato del package.json. Avvisare conflict dipendenze o versioni piu vecchie. Queste hanno priorità su commonDependencies
                    "path":"./deployment1/onit-next" // aggiornare package json di questo path
                }
            }
            "deployment2": {
                "target":"id-target-2"
                "path":"./deployment2/onit-next"
            }
        }
    }],
    targets: [
        {
            id:"id-target1",
            host:"....azure.com"
            sshKey:"......"
        },
        {
            id:"id-target-2",
            host:".....azure.com"
            sshKey:"......"
        }
    ]
}
 
*/
/**
  * Lista di files da cercare.
  * NOTA: Escludi le estensioni verranno processate automaticamente ".js e .json"
  *
  */
const baseFilenames = [
    path.join(process.cwd(), '.mitechcli'),
    path.join(process.cwd(), '../.mitechcli'),
    path.join(process.cwd(), '../../.mitechcli')
];

function loadFile() {
    for (const baseFilename of baseFilenames) {
        const jsFilename = baseFilename + '.js';
        if (fs.existsSync(jsFilename)) {
            try {
                return { file: jsFilename, content: require(jsFilename) } as MitechCliFile;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                throw new StringError(e.message.split('\n')[0]+'\nVerifica sintassi del tuo file '+jsFilename);
            }
        }

        for (const extension of ['', '.json']) {
            const filename = baseFilename + extension;
            if (fs.existsSync(filename)) {
                try {
                    return { file: filename, content: JSON.parse(fs.readFileSync(filename).toString()) } as MitechCliFile;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                    throw new StringError(e.message+'\nVerifica sintassi del tuo file '+jsFilename);
                }
            }
        }
    }
}

/**
 * ensure validity and uniqueness of target name
 * 
 * @param f 
 */
function ensureNameUniqueness(f: MitechCliFile) {
    const cache: GenericObject = {};
    (f.content.targets ?? []).forEach(t => {
        if (!t.name) {
            throw new StringError('Missing name in target. Please set it in your package.json file.');
        }
        if (cache[t.name]) {
            throw new StringError(`Duplicate target name '${t.name}'.\nPlease make this value unique in your .mitechcli file.`);
        }
        cache[t.name] = true;
    });
}

/**
 * Read the mitechCli file. Searhc for different filenames, extensions and paths. The first found is the one used.
 * @returns
 */
export function getMitechCliFile() {

    const f = loadFile();
    if (!f) {
        throw new StringError('Nessun file .mitechcli[.js|.json] trovato');
    }

    ensureNameUniqueness(f);
   
    (f.content.targets ?? []).forEach(t => {
        if (!t.environment) t.environment = 'pm2';
        if (!t.nodeUser) t.nodeUser='onit';
        if (!t.port) t.port=22;
    });
    return f;
}

