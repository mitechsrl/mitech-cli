"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMitechCliFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../types");
const lodash_1 = __importDefault(require("lodash"));
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
    path_1.default.join(process.cwd(), '.mitechcli'),
    path_1.default.join(process.cwd(), 'mitechcli'),
    path_1.default.join(process.cwd(), '../.mitechcli'),
    path_1.default.join(process.cwd(), '../mitechcli'),
    path_1.default.join(process.cwd(), '../../.mitechcli'),
    path_1.default.join(process.cwd(), '../../mitechcli'),
];
function loadFile(baseFilenames) {
    for (const baseFilename of baseFilenames) {
        const jsFilename = baseFilename + '.js';
        if (fs_1.default.existsSync(jsFilename)) {
            try {
                return { files: [jsFilename], content: require(jsFilename) };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                throw new types_1.StringError(e.message.split('\n')[0] + '\nVerifica sintassi del tuo file ' + jsFilename);
            }
        }
        for (const extension of ['', '.json']) {
            const filename = baseFilename + extension;
            if (fs_1.default.existsSync(filename)) {
                try {
                    return { files: [filename], content: JSON.parse(fs_1.default.readFileSync(filename).toString()) };
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }
                catch (e) {
                    throw new types_1.StringError(e.message + '\nVerifica sintassi del tuo file ' + jsFilename);
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
function ensureNameUniqueness(f) {
    var _a;
    const cache = {};
    ((_a = f.content.targets) !== null && _a !== void 0 ? _a : []).forEach(t => {
        if (!t.name) {
            throw new types_1.StringError('Missing name in target. Please set it in your package.json file.');
        }
        if (cache[t.name]) {
            throw new types_1.StringError(`Duplicate target name '${t.name}'.\nPlease make this value unique in your .mitechcli file.`);
        }
        cache[t.name] = true;
    });
}
let cachedMitechCliFile;
/**
 * Read the mitechCli file. Searhc for different filenames, extensions and paths. The first found is the one used.
 * @returns
 */
function getMitechCliFile() {
    var _a;
    if (cachedMitechCliFile)
        return cachedMitechCliFile;
    const f = loadFile(baseFilenames);
    if (!f) {
        throw new types_1.StringError('Nessun file .mitechcli[.js|.json] trovato');
    }
    const stagedFilenames = baseFilenames.map(f => f + '.staged');
    const stagedFile = loadFile(stagedFilenames);
    if (stagedFile) {
        // Merge the two jsons. Array are concatenated.
        f.content = lodash_1.default.mergeWith(f.content, stagedFile.content, (objValue, srcValue) => {
            // in case of arrays merge them by concat
            if (Array.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        });
        f.files.push(...stagedFile.files);
    }
    if (!f.files.length) {
        throw new Error('No files found');
    }
    ensureNameUniqueness(f);
    ((_a = f.content.targets) !== null && _a !== void 0 ? _a : []).forEach(t => {
        if (!t.environment)
            t.environment = 'pm2';
        if (!t.nodeUser)
            t.nodeUser = 'onit';
        if (!t.port)
            t.port = 22;
    });
    cachedMitechCliFile = f;
    return f;
}
exports.getMitechCliFile = getMitechCliFile;
//# sourceMappingURL=mitechCliFile.js.map