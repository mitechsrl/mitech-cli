"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundBell = void 0;
const path_1 = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const player = require('node-wav-player');
/**
 * Play a bell sound.
 * When walking around in the office, use --sound to get sounds on events.
 * https://www.youtube.com/watch?v=jW3_txSfIAQ&t=960s
 */
async function soundBell() {
    if (process.argv.find(p => p === '--sounds')) {
        const wav = (0, path_1.join)(__dirname, '../../assets/sounds/mixkit-modern-classic-door-bell-sound-113.wav');
        return player.play({
            path: wav,
            sync: true
        });
    }
}
exports.soundBell = soundBell;
//# sourceMappingURL=sound.js.map