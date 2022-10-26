"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGit = void 0;
const spawn_1 = require("../../../../lib/spawn");
/**
 * setup the current git directory
 * @param answers
 */
async function setupGit(answers) {
    await (0, spawn_1.spawn)('git', ['init'], true);
    for (const submodule of answers.subpackages) {
        await (0, spawn_1.spawn)('git', ['submodule', 'add', submodule.git], true);
    }
    await (0, spawn_1.spawn)('git', ['add', '.']);
    await (0, spawn_1.spawn)('git', ['commit', '-m', '"Workspace setup"']);
}
exports.setupGit = setupGit;
//# sourceMappingURL=setupGit.js.map