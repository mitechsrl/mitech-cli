"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateComposeConfig = void 0;
const types_1 = require("../../../../types");
const jsonEnvVars = ['PUBSUB_CONFIG', 'DATASOURCES'];
// Check the value of string "PROPERTY=value" is a valid json
const checkArrayStringItem = (property, testString, path) => {
    if (!testString.startsWith(property + '='))
        return;
    try {
        JSON.parse(testString.substring(property.length + 1));
    }
    catch (e) {
        throw new types_1.StringError(`Invalid JSON in ${[...path, property].join('.')}: ${e.message}`);
    }
};
/**
* Traverse a json object and for some properties check the value is a valid stringified json.
 * @param json
 * @returns
 */
function checkJsonProperties(json, path = []) {
    // Check some values from environemnt, they need to be correct json
    if (Array.isArray(json) && [...path].pop() === 'environment') {
        json.forEach((v) => {
            jsonEnvVars.forEach(p => checkArrayStringItem(p, v, path));
        });
        return;
    }
    // Recurse on sub-objects
    if (Array.isArray(json))
        json.forEach((j, i) => checkJsonProperties(j, [...path, `[${i}]`]));
    if (json && (typeof json === 'object')) {
        for (const key of Object.keys(json)) {
            checkJsonProperties(json[key], [...path, key]);
        }
    }
}
/**
 * Ensure volumes is a non-empty array, if present.
 * @param json
 */
function checkVolumes(json) {
    var _a;
    for (const key of Object.keys((_a = json.services) !== null && _a !== void 0 ? _a : {})) {
        const service = json.services[key];
        if (Object.prototype.hasOwnProperty.call(service, 'volumes')) {
            if (!Array.isArray(service.volumes)) {
                throw new types_1.StringError(`Invalid volumes in services.${key}.volumes: must be an array`);
            }
            if (service.volumes.length === 0) {
                throw new types_1.StringError(`Invalid volumes in services.${key}.volumes: must not be empty`);
            }
        }
    }
}
/**
 * Per scelta interna, obbligo a mettere il tag dell'immagine in modo da evitare errori di deploy e
 * aggiornamenti non voluti.
 * Inoltre semplifica una parte di processo di verifica del deploy
 * @param json
 */
async function checkImageTag(json) {
    for (const service of Object.keys(json.services)) {
        const image = json.services[service].image;
        if (image.split(':').length === 1) {
            throw new Error('Immagine non valida: ' + image + ' manca il tag (aggiungi :VERSIONE alla fine)');
        }
    }
}
/**
 * Check json properties for correctness.
 * This is an additional check to ensure the file is correct, it does not affect the file itself.
 * @param json
 * @param path
 */
function validateComposeConfig(json, path = []) {
    checkJsonProperties(json, path);
    checkVolumes(json);
    checkImageTag(json);
}
exports.validateComposeConfig = validateComposeConfig;
//# sourceMappingURL=validateComposeConfig.js.map