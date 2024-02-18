import { GenericObject } from '../../../../types';
/**
 * Check json properties for correctness.
 * This is an additional check to ensure the file is correct, it does not affect the file itself.
 * @param json
 * @param path
 */
export declare function validateComposeConfig(json: GenericObject, path?: string[]): void;
