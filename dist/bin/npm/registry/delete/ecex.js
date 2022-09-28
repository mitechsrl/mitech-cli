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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../lib/logger");
const npm_1 = require("../../../../lib/npm");
const exec = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.log('Seleziona il registry da eliminare');
    const registry = yield (0, npm_1.getRegistry)(undefined, undefined, false);
    if (!registry)
        return;
    let npmInfo = (0, npm_1.getNpmPersistent)();
    npmInfo = npmInfo.filter(r => r.id !== registry.id);
    (0, npm_1.setNpmPersistent)(npmInfo);
    logger_1.logger.log('Registry rimosso!');
});
exports.default = exec;
//# sourceMappingURL=ecex.js.map