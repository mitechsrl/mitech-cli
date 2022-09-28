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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../lib/logger");
const types_1 = require("../../../types");
const exec = async (argv) => {
    const packageJsonToBeUpdate = argv.p;
    const dependency = argv.d;
    const dependencyVersion = argv.v;
    if (!packageJsonToBeUpdate)
        throw new types_1.StringError('Parametro <-p> non specificato. Vedi <-h> per help');
    if (!dependency)
        throw new types_1.StringError('Parametro <-d> non specificato. Vedi <-h> per help');
    if (!dependencyVersion)
        throw new types_1.StringError('Parametro <-dv> non specificato. Vedi <-h> per help');
    const file = path_1.default.resolve(process.cwd(), packageJsonToBeUpdate);
    const fileContent = await fs_1.default.promises.readFile(file);
    const json = JSON.parse(fileContent.toString());
    json.dependencies = json.dependencies || {};
    json.dependencies[dependency] = dependencyVersion;
    await fs_1.default.promises.writeFile(file, JSON.stringify(json, null, 4));
    logger_1.logger.info('Update completato');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map