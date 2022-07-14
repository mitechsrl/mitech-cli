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
  * Lista di files da scansionare alla ricerca di targets
  */
const localFiles = [
    path.join(process.cwd(), '.mitechcli'),
    path.join(process.cwd(), '.mitechcli.js'),
    path.join(process.cwd(), '.mitechcli.json'),
    path.join(process.cwd(), '../.mitechcli'),
    path.join(process.cwd(), '../.mitechcli.js'),
    path.join(process.cwd(), '../.mitechcli.json'),
    path.join(process.cwd(), '../../.mitechcli'),
    path.join(process.cwd(), '../../.mitechcli.js'),
    path.join(process.cwd(), '../../.mitechcli.json')
];

/**
  * get the targets list from the first of the localFiles found
  */
const getMitechCliFile = function () {
    return localFiles.reduce((found, localFile) => {
        if (found !== null) return found;

        if (fs.existsSync(localFile)) {
            let file = null;

            // if the file is a js one, just require it and use directly
            if (localFile.endsWith('.js')) {
                try {
                    file = require(localFile);
                    return { file: localFile, content: file };
                } catch (e) {
                    logger.error(e);
                    return null;
                }
            }

            // file is not a js. Try to get it as json
            file = fs.readFileSync(localFile).toString();
            try {
                file = JSON.parse(file);
                return { file: localFile, content: file };
            } catch (e) {
                logger.error(e);
                return null;
            }
        }
        return null;
    }, null);
};

module.exports = {
    getMitechCliFile: getMitechCliFile
};
