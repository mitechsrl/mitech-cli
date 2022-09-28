"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUptimeChecks = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function listUptimeChecks() {
    const files = fs_1.default.readdirSync(path_1.default.join(__dirname, './uptimeChecks'));
    return files.filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, '')).join(', ');
}
exports.listUptimeChecks = listUptimeChecks;
//# sourceMappingURL=listUptimeChecks.js.map