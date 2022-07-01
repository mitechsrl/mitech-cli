/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const fs = require('fs');
const path = require('path');

const baseConfigDir = path.join(process.env.APPDATA, './mitech-cli');
module.exports.baseConfigDir = baseConfigDir;

const checkDir = function (key) {
    const mitechCliDbPath = baseConfigDir;
    if (!fs.existsSync(mitechCliDbPath)) {
        fs.mkdirSync(mitechCliDbPath);
    }

    if (key) {
        const keyPath = path.join(mitechCliDbPath, './' + key);
        if (!fs.existsSync(keyPath)) {
            fs.mkdirSync(keyPath);
        }
    }
};

module.exports.get = function (key, filename) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    if (!fs.existsSync(_filename)) {
        fs.writeFileSync(_filename, '{}');
        return {};
    } else {
        return JSON.parse(fs.readFileSync(_filename));
    }
};

module.exports.set = function (key, obj, filename) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    // console.log('File: ' + _filename);
    fs.writeFileSync(_filename, JSON.stringify(obj, null, 4));
};
