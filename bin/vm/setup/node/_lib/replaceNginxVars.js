const fs = require('fs');

module.exports.replaceNginxVars = (nginxFile, answers) => {
    let file = fs.readFileSync(nginxFile).toString();
    Object.keys(answers).forEach(key => {
        file = file.replace(new RegExp('\\$' + key + '\\$', 'gm'), answers[key]);
    });

    return file;
};
