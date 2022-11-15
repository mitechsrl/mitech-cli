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
const databaseSelector_1 = require("../../../lib/databaseSelector");
const types_1 = require("../../../types");
const mongo_1 = require("../_lib/mongo");
/**
 * Generic dump method
 * @param database
 */
async function dump(database) {
    var _a;
    switch (database.type) {
        case 'mongodb': {
            await (0, mongo_1.dumpMongo)(database);
            break;
        }
        default: throw new types_1.StringError('Il tipo di database <' + ((_a = database.type) !== null && _a !== void 0 ? _a : '') + '> non è supportato');
    }
}
const exec = async (argv) => {
    const database = await (0, databaseSelector_1.getDatabase)();
    (0, databaseSelector_1.printDatabase)(database);
    await dump(database);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map