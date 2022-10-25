"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGitSubmodules = exports.initGit = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const spawn_1 = require("../../../../lib/spawn");
const ejs_1 = __importDefault(require("ejs"));
/**
 * setup the current git directory
 * @param answers
 */
async function initGit(answers) {
    await (0, spawn_1.spawn)('git', ['init'], true);
    const template = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, './templates/gitignore.ejs')).toString();
    const rendered = ejs_1.default.render(template, answers);
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), '.gitignore'), rendered);
}
exports.initGit = initGit;
/**
 * Setup submodules from user selection
 * @param answers
 */
async function initGitSubmodules(answers) {
    for (const submodule of answers.subpackages) {
        await (0, spawn_1.spawn)('git', ['submodule', 'add', submodule.git], true);
    }
}
exports.initGitSubmodules = initGitSubmodules;
//# sourceMappingURL=initGit.js.map