"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDeployment = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const types_1 = require("../../../../types");
/**
 * Deployment check function. Just check values and throw on error.
 *
 * @param basePath
 * @param mitechCliFileContent
 * @param deployment
 */
function checkDeployment(basePath, mitechCliFileContent, deployment) {
    const packageJsonPath = path_1.default.join(basePath, deployment.path, 'package.json');
    if (!(0, fs_1.existsSync)(packageJsonPath)) {
        throw new types_1.StringError(`File ${packageJsonPath} not found`);
    }
    // this throws in case of errors
    JSON.parse((0, fs_1.readFileSync)(packageJsonPath).toString());
    if (!deployment.target) {
        throw new types_1.StringError(`No target defined for deployment ${deployment.name}.`);
    }
    if (!mitechCliFileContent.targets.find(t => t.name === deployment.target)) {
        throw new types_1.StringError(`Target ${deployment.target} does not exist. Please change target name in .mitechcli file`);
    }
}
exports.checkDeployment = checkDeployment;
//# sourceMappingURL=checkDeployment.js.map