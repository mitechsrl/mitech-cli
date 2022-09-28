import { GenericObject } from '../../../../types';
/**
 *
 * @param {*} basePath
 * @param {*} deployment
 * @param {*} commonDependencies
 * @param {*} writeFile write the package.json file. If false, only eventual merge errors are checked.
 */
export declare function mergeDependencies(basePath: string, deployment: GenericObject, commonDependencies: GenericObject, writeFile: boolean, forceDependencies: boolean): void;
