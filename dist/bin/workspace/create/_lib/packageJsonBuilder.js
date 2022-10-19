"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageJsonBuilder = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Creates a workspace package.json file in the current working directory
 * @param answers
 */
function packageJsonBuilder(answers) {
    const packageJson = {
        name: answers.name,
        workspaces: answers.subpackages.map((s) => s.dir),
        scripts: Object.assign(answers.subpackages.reduce((acc, p) => {
            acc['precompile:packages'] += ' precompile:' + p.dir;
            acc['precompile:' + p.dir] = `cd ./${p.dir} && npm run clean && onit serve -t -exit && onit serve -w -exit && cd ../`;
            return acc;
        }, { 'precompile:packages': 'run-s' }), {
            'precompile': 'npm run precompile:packages',
            'fetch:all': 'git fetch --recurse-submodules',
            'pull:all': 'git pull --recurse-submodules',
            'boot': 'git submodule init && git submodule update && npm install',
            'serve': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve` : '',
            'start': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve` : '',
            'uninstall': 'node ./node_modules/@mitech/onit-dev-tools/tools/uninstall'
        }),
        dependencies: {
            'npm-run-all': '^4.1.5'
        }
    };
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 4));
}
exports.packageJsonBuilder = packageJsonBuilder;
//# sourceMappingURL=packageJsonBuilder.js.map