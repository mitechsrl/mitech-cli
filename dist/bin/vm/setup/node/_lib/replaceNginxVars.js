"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceNginxVars = void 0;
const fs_1 = require("fs");
function replaceNginxVars(nginxFile, answers) {
    let file = (0, fs_1.readFileSync)(nginxFile).toString();
    Object.keys(answers).forEach(key => {
        file = file.replace(new RegExp('\\$' + key + '\\$', 'gm'), answers[key]);
    });
    return file;
}
exports.replaceNginxVars = replaceNginxVars;
//# sourceMappingURL=replaceNginxVars.js.map