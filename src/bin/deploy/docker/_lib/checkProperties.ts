import { GenericObject, StringError } from '../../../../types';

const jsonEnvVars = ['PUBSUB_CONFIG', 'DATASOURCES'];

// Check the value of string "PROPERTY=value" is a valid json
const checkArrayStringItem = (property: string, testString: string, path: string[]) => {
    if (!testString.startsWith(property + '=')) return;
    try {
        JSON.parse(testString.substring(property.length + 1));
    } catch (e: any) {
        throw new StringError(`Invalid JSON in ${[...path, property].join('.')}: ${e.message}`);
    }
};

/**
* Traverse a json object and for some properties check the value is a valid stringified json.
 * @param json
 * @returns
 */
function checkJsonProperties(json: GenericObject, path: string[] = []): void {

    // Check some values from environemnt, they need to be correct json
    if (Array.isArray(json) && [...path].pop() === 'environment') {
        json.forEach((v: string) => {
            jsonEnvVars.forEach(p => checkArrayStringItem(p, v, path));
        });
        return;
    }

    // Recurse on sub-objects
    if (Array.isArray(json)) json.forEach((j, i) => checkJsonProperties(j, [...path, `[${i}]`]));
    if (json && (typeof json === 'object')) {
        for (const key of Object.keys(json)) {
            checkJsonProperties(json[key], [...path, key]);
        }
    }
}

/**
 * Check json properties for correctness.
 * This is an additional check to ensure the file is correct, it does not affect the file itself.
 * @param json
 * @param path 
 */
export function checkProperties(json: GenericObject, path: string[] = []): void {
    // Check some specific properties for json correctness
    checkJsonProperties(json, path);
}