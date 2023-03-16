/**
 * Cli process.env management
 */
export const environment = {
    encryptionKey: process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || ''
};