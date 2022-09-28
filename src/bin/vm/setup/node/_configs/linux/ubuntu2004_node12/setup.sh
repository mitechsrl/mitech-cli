#!/bin/bash
#NOTA: prima di eseguire questo script caricare il file nginx-default.conf in /tmp/nginx.conf

NODEUSER="onit"
if [ $# -eq 0 ]; then
	echo "Usage: setup.sh nodeuser"
	exit -1
else
	NODEUSER=$1
fi

######## install nginx, node and deps
# installo curl. Dovrebbe essere gia' installato ma non si sa mai
apt install -y curl
# vado nella mia home e setto i repository di node(default v12, per altre versioni cambiare _12.x con _14.x)
cd ~
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
chmod +x nodesource_setup.sh
./nodesource_setup.sh
# install di tutto
apt install -y nodejs gcc g++ make nginx
# setup servizio nginx come attivo al boot
systemctl enable nginx.service
# install pm2
npm install pm2@4.4.1 -g

######## setup nginx
# sposto il file di config precedentemente caricato nella sua destinazione finale
mv /tmp/nginx.conf /etc/nginx/sites-available/default
# setta index.html vuoto (servito su richieste con hostname errato)
echo 'Nginx: hostname not allowed' > /var/www/html/index.html
chown www-data:www-data /var/www/* -R
systemctl restart nginx.service

######## crea utente dedicato a node. NOTA: non gli si assegna alcuna password. L'utente non potrà accedere via ssh.
useradd -m $NODEUSER -s /usr/bin/bash
# creo la dir di destinazione delle app node (e lo assegno all'user node)
mkdir /home/$NODEUSER/apps
chown $NODEUSER:$NODEUSER /home/$NODEUSER/apps
chmod 755 /home/$NODEUSER/apps
# setto pm2 attivo all'avvio come utente node
pm2 startup -u $NODEUSER --hp /home/$NODEUSER
# spawn pm2 da user node
su $NODEUSER -c "cd /home/$NODEUSER; pm2 status"