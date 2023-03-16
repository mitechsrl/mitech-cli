"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
/**
 * Cli process.env management
 */
exports.environment = {
    encryptionKey: process.env.MitechCliEncryptionKey || process.env.mitechcliencryptionkey || process.env.MITECHCLIENCRYPTIONKEY || ''
};
//# sourceMappingURL=environment.js.map