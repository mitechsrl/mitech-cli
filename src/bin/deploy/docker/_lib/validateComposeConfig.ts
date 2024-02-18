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
 * Ensure volumes is a non-empty array, if present.
 * @param json 
 */
function checkVolumes(json: GenericObject): void {
    for (const key of Object.keys(json.services ?? {})) {
        const service = json.services[key];
        if (Object.prototype.hasOwnProperty.call(service, 'volumes')) {
            if (!Array.isArray(service.volumes)) {
                throw new StringError(`Invalid volumes in services.${key}.volumes: must be an array`);
            }
            if (service.volumes.length === 0) {
                throw new StringError(`Invalid volumes in services.${key}.volumes: must not be empty`);
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
async function checkImageTag(json: GenericObject): Promise<void> {
    for (const service of Object.keys(json.services)) {
        const image = json.services[service].image;
        if (image.split(':').length === 1){
            throw new Error('Immagine non valida: '+image+' manca il tag (aggiungi :VERSIONE alla fine)');
        }
    }
}
/**
 * Check json properties for correctness.
 * This is an additional check to ensure the file is correct, it does not affect the file itself.
 * @param json
 * @param path 
 */
export function validateComposeConfig(json: GenericObject, path: string[] = []): void {
    checkJsonProperties(json, path);
    checkVolumes(json);
    checkImageTag(json);
}