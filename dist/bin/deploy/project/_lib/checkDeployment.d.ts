import { GenericObject, MitechCliFileContent } from '../../../../types';
/**
 * Deployment check function. Just check values and throw on error.
 *
 * @param basePath
 * @param mitechCliFileContent
 * @param deployment
 */
export declare function checkDeployment(basePath: string, mitechCliFileContent: MitechCliFileContent, deployment: GenericObject): void;
