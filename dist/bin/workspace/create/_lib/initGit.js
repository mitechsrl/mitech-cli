"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGitSubmodules = exports.initGit = void 0;
const spawn_1 = require("../../../../lib/spawn");
/**
 * setup the current git directory
 * @param answers
 */
async function initGit(answers) {
    await (0, spawn_1.spawn)('git', ['init'], true);
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