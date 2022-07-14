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

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
/*
Example of mitechcli file
{
	"projects":[{ // optional
		"name": "onit-next"
		"commonDependencies": {}, // stesso formato del package.json
		"deployments":{   // selezione multipla con anche "tutti"
			"dab": {
					"target":"id-dab", //target ssh
					"dependencies":{} // stesso formato del package.json. Avvisare conflict dipendenze o versioni piu vecchie. Queste hanno priorità su commonDependencies
					"path":"./dab/onit-next" // aggiornare package json di questo path
				}
			}
			"zpc": {
				"target":"id-dab"
				"path":"./dab/onit-next"
			}
		}
	}],
	targets: [
		{
			id:"id-zpc",
			host:"zpc.....azure.com"
			sshKey:"......"
		},
		{
			id:"id-zpc",
			host:"zpc.....azure.com"
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

/**
 * Read the mitechCli file. Searhc for different filenames, extensions and paths. The first found is the one used.
 * @returns
 */
const getMitechCliFile = function () {
    const loadFile = () => {
        for (const baseFilename of baseFilenames) {
            const jsFilename = baseFilename + '.js';
            if (fs.existsSync(jsFilename)) {
                try {
                    return { file: jsFilename, content: require(jsFilename) };
                } catch (e) {
                    logger.error(e);
                    return null;
                }
            }

            for (const extension of ['', '.json']) {
                const filename = baseFilename + extension;
                if (fs.existsSync(filename)) {
                    try {
                        return { file: filename, content: JSON.parse(fs.readFileSync(filename).toString()) };
                    } catch (e) {
                        logger.error(e);
                        return null;
                    }
                }
            }
        }
    };

    const f = loadFile();
    if (!f) return null;

    // ensure validity and uniqueness of name
    ['name'].forEach(property => {
        const cache = {};
        f.content.targets.forEach(t => {
            if (!t[property]) throw new Error('Missing name in target. Please set it in your package.json file.');
            if (cache[t[property]]) throw new Error(`Duplicate target ${property} ${t[property]}.\nPlease make this value unique in your .mitechcli file.`);
            cache[t[property]] = true;
        });
    });

    return f;
};

module.exports = {
    getMitechCliFile: getMitechCliFile
};
