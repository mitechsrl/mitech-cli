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
const databaseSelector_1 = require("../../../../lib/databaseSelector");
const logger_1 = require("../../../../lib/logger");
const types_1 = require("../../../../types");
const mongo_1 = require("../../_lib/mongo");
/**
 * Generic dump method
 * @param database
 */
async function restore(database, argv) {
    var _a, _b;
    switch (database.type) {
        case 'mongodb': {
            const dir = await (0, mongo_1.selectMongodumpDir)(database);
            // drop the databases before running the restore
            if (argv.drop) {
                for (const n of (_a = database.databaseNames) !== null && _a !== void 0 ? _a : []) {
                    await (0, mongo_1.dropLocalDatabase)(n, database);
                }
            }
            await (0, mongo_1.restoreMongo)(dir, database);
            break;
        }
        default: throw new types_1.StringError('Il tipo di database <' + ((_b = database.type) !== null && _b !== void 0 ? _b : '') + '> non è supportato');
    }
}
const exec = async (argv) => {
    logger_1.logger.warn('NOTA: la selezione verrà usata solo per determinare il tipo di database. Non verranno effettuate altre operazioni.');
    const database = await (0, databaseSelector_1.getDatabase)();
    (0, databaseSelector_1.printDatabase)(database);
    /**/
    await restore(database, argv);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map