module.exports = {
    name: 'Ubuntu 20.04, Node 12.X, Nginx, pm2 4.4.1',
    value: {
        questions: [{
            type: 'input',
            name: 'MITECH_HOSTNAME',
            message: 'FQDN hostname (solo ip/dns senza http(s)://)'
        }]
    }
};
