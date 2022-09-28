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
Object.defineProperty(exports, "__esModule", { value: true });
const targets_1 = require("../../../lib/targets");
const ssh_1 = require("../../../lib/ssh");
const exec = async (argv) => {
    const target = await (0, targets_1.getTarget)();
    (0, targets_1.printTarget)(target);
    (0, ssh_1.interativeClient)(target, argv._.slice(2).map(v => v.toString()));
};
exports.default = exec;
//# sourceMappingURL=exec.js.map