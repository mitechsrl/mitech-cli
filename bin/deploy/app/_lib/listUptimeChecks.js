const path = require('path');
const fs = require('fs');

module.exports.listUptimeChecks = () => {
    const files = fs.readdirSync(path.join(__dirname, './uptimeChecks'));
    return files.map(f => f.replace(/\.js$/, '')).join(', ');
};
