/**
 * Create a tar archive of the toUpload direcotry or file
 * use .mitechcliignore to skip files
 *
 * @returns a tmp file (see npm tmp-promise)
 */
export declare function createPackage(toUpload: string): Promise<import("tmp-promise").FileResult>;
