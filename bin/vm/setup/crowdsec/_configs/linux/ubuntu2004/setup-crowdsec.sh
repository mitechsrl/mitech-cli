#!/bin/bash

curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | bash
apt install crowdsec

# cambia la porta 8080 che è occupata da node
sed -i "s/listen_uri: 127.0.0.1:8080/listen_uri: 127.0.0.1:41080/g"  /etc/crowdsec/config.yaml
sed -i "s/127.0.0.1:8080/127.0.0.1:41080/g" /etc/crowdsec/local_api_credentials.yaml

# setta ip server mitech (51.137.115.69) nella whitelist. Questo per avere un ip mai bloccato per casi di emergenza
echo "name: crowdsecurity/whitelists" > /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
echo "description: \"Whitelist events from my ip addresses\"" >> /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
echo "whitelist:" >> /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
echo "  reason: \"mitech ips\"" >> /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
echo "  ip:" >> /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
echo "    - \"51.137.115.69\"" >> /etc/crowdsec/parsers/s02-enrich/mitechwhitelists.yaml
	
# restart per applicare nuova config (porte in primis)
systemctl restart crowdsec	

# install bouncer iptables
apt install crowdsec-firewall-bouncer-iptables

# install configurazione per processare logs nginx
cscli collections install crowdsecurity/nginx

# reload finale. Da qui in poi crowdsec è attivo
systemctl reload crowdsec