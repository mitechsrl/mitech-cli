"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyTemplate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const ejs_1 = __importDefault(require("ejs"));
const glob_1 = __importDefault(require("glob"));
const util_1 = __importDefault(require("util"));
/**
 * Render and copy all the ./template files, except some one that are managed manually
 * @param answers
 */
async function copyTemplate(answers) {
    const promiseGlob = util_1.default.promisify(glob_1.default);
    const templatePath = (0, path_1.join)(__dirname, './templates');
    // search all files in template
    const files = await promiseGlob('./**/*', { dot: true, cwd: templatePath });
    const excludeFiels = ['package.json'];
    console.log(files);
    // render and save out all the found files.
    // Package.json is omitted since is managed by other code
    for (const file of files) {
        // do not process some files
        if (excludeFiels.includes(file))
            continue;
        const template = fs_1.default.readFileSync((0, path_1.join)(templatePath, file)).toString();
        const rendered = ejs_1.default.render(template, answers);
        const finalFileName = (0, path_1.join)(process.cwd(), file.replace('.ejs', ''));
        console.log('Rendering ' + finalFileName);
        const dir = (0, path_1.dirname)(finalFileName);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(finalFileName, rendered);
    }
}
exports.copyTemplate = copyTemplate;
//# sourceMappingURL=copyTemplate.js.map