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

const target = require('../../../lib/target');
const ssh = require('../../../lib/ssh');
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');
const tmp = require('tmp-promise');
var NginxConfFile = require('nginx-conf').NginxConfFile;

module.exports.info = 'Utility setup ssl VM';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    const t = await target.get();
    target.print(t);

    console.log('');
    let questions = [{
        type: 'input',
        name: 'privateKey',
        message: 'File chiave privata'
    },
    {
        type: 'input',
        name: 'crt',
        message: 'Bundle crt'
    }];
    const answers = {};
    while (questions.length > 0) {
        const _answers = await inquirer.prompt(questions);
        questions = questions.filter(q => {
            if (fs.existsSync(_answers[q.name])) {
                answers[q.name] = _answers[q.name];
                return false;
            } else {
                return true;
            }
        });

        if (questions.length > 0) {
            logger.warn('Alcuni files non trovati. Completa le domande');
        }
    };

    const session = await ssh.createSshSession(t);

    const tmpFile = await tmp.file({ discardDescriptor: true, postfix: '.conf' });
    await session.downloadFile('/etc/nginx/sites-available/default', tmpFile.path);

    NginxConfFile.create(tmpFile.path, async function (err, conf) {
        if (err) {
            console.log(err);
            return;
        }

        const servers = conf.nginx.server.map((s, index) => ({ name: s.server_name._value.trim(), value: index }));
        const questions = [{
            type: 'list',
            name: 'server_index',
            message: 'Seleziona server_name su cui applicare il certificato ssl',
            choices: servers
        }];

        const answers2 = await inquirer.prompt(questions);

        logger.info('Modifico file di configurazione nginx...');

        if (!conf.nginx.server[answers2.server_index].listen.find(l => l._value === '443')) {
            conf.nginx.server[answers2.server_index]._add('listen', '443');
        }
        if (!conf.nginx.server[answers2.server_index].listen.find(l => l._value === '[::]:443')) {
            conf.nginx.server[answers2.server_index]._add('listen', '[::]:443');
        }

        conf.nginx.server[answers2.server_index]._remove('ssl_certificate_key');
        conf.nginx.server[answers2.server_index]._remove('ssl_certificate');

        conf.nginx.server[answers2.server_index]._add('ssl_certificate_key', '/etc/nginx/certificates/private_key.key');
        conf.nginx.server[answers2.server_index]._add('ssl_certificate', '/etc/nginx/certificates/bundle.crt');

        // force the synchronization
        conf.flush();
        logger.info('Upload files...');
        await session.command(['mkdir', '-p', '/etc/nginx/certificates/']);
        await session.uploadFile(answers.privateKey, '/etc/nginx/certificates/private_key.key');
        await session.uploadFile(answers.crt, '/etc/nginx/certificates/bundle.crt');
        await session.uploadFile(tmpFile.path, '/etc/nginx/sites-available/default');

        logger.info('Riavvio nginx...');
        await session.comand(['systemctl', 'reload', 'nginx.service']);

        logger.info('Completato');
        session.disconnect();
        tmpFile.cleanup();
    });
};

