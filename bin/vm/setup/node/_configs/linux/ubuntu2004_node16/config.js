module.exports = {
    name: 'Ubuntu 20.04, Node 16.X, Nginx, pm2 5.1.2',
    value: {
        questions: [{
            type: 'input',
            name: 'MITECH_HOSTNAME',
            message: 'FQDN hostname (solo ip/dns senza http(s)://)'
        }]
    }
};
