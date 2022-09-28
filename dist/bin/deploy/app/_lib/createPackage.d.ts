/**
 * Create a tar archive of the process.cwd() directory
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
export declare function createPackage(): Promise<import("tmp-promise").FileResult>;
