"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMyIpAddressFromGeoDyn = void 0;
const validateIpAddress_1 = require("../../_lib/validateIpAddress");
const tmp_promise_1 = require("tmp-promise");
const fs_1 = __importDefault(require("fs"));
async function removeMyIpAddressFromGeoDyn(session, geoDynFileName, remoteNginxGeoDynFile, remoteTempDirGeoDynFile) {
    const response = await fetch('https://api.ipify.org');
    const ip = (await response.text()).trim();
    if (!(0, validateIpAddress_1.validateIPaddress)(ip)) {
        console.warn('Impossibile rimuovere l\'indirizzo ip locale da ' + geoDynFileName);
        return;
    }
    console.warn(`Rimuovo ip locale ${ip} da ${geoDynFileName}`);
    // Prima scarico il file su server
    const tmpFile = await (0, tmp_promise_1.file)({ discardDescriptor: true, postfix: '.conf' });
    await session.downloadFile(remoteNginxGeoDynFile, tmpFile.path);
    // Leggo il file e lo splitto per righe. Dobbiamo eliminare quella contenente il nostro ip
    const fileContent = (await fs_1.default.promises.readFile(tmpFile.path)).toString();
    let fileContentLines = fileContent.split('\n');
    fileContentLines = fileContentLines.filter(l => l.indexOf(ip) < 0);
    // riscrivo il file e lo ricarico su server
    await fs_1.default.promises.writeFile(tmpFile.path, fileContentLines.join('\n'));
    await session.uploadFile(tmpFile.path, remoteTempDirGeoDynFile);
    await session.command(`sudo mv ${remoteTempDirGeoDynFile} ${remoteNginxGeoDynFile}`);
    // rile temporaneo non piu utile. Viene buttato via.
    tmpFile.cleanup();
}
exports.removeMyIpAddressFromGeoDyn = removeMyIpAddressFromGeoDyn;
//# sourceMappingURL=removeMyIpAddressFromGeoDyn.js.map