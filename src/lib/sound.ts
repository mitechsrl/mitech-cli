import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const player = require('node-wav-player');

/**
 * Play a bell sound.
 * Requires the param --sound
 */
export async function soundBell(){
    if (process.argv.find(p => p=== '--sounds')){
        const wav = join(__dirname,'../../assets/sounds/mixkit-modern-classic-door-bell-sound-113.wav');
        return player.play({
            path: wav,
            sync:true
        });
    }
}

