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
    const packageJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, './templates/package.json')).toString());
    packageJson.name = answers.name,
        packageJson.workspaces = [...packageJson.workspaces, ...answers.subpackages.map((s) => s.dir)],
        packageJson.scripts = Object.assign(answers.subpackages.reduce((acc, p) => {
            acc['precompile:packages'] += ' precompile:' + p.dir;
            acc['precompile:' + p.dir] = `cd ./${p.dir} && npm run clean && onit serve -t -exit && onit serve -w -exit && cd ../`;
            return acc;
        }, {
            'precompile:packages': 'run-s',
            'serve': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve` : '',
            'start': answers.mainPackage ? `cd ./${answers.mainPackage.dir} && onit serve` : '',
        }), packageJson.scripts);
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 4));
}
exports.packageJsonBuilder = packageJsonBuilder;
//# sourceMappingURL=packageJsonBuilder.js.map