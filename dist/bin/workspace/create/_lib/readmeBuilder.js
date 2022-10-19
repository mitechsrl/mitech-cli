"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readmeBuilder = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const ejs_1 = __importDefault(require("ejs"));
function readmeBuilder(answers) {
    const template = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, './templates/readme.md.ejs')).toString();
    const rendered = ejs_1.default.render(template, answers);
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), 'README.md'), rendered);
}
exports.readmeBuilder = readmeBuilder;
//# sourceMappingURL=readmeBuilder.js.map