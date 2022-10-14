#!/bin/bash
#NOTA: prima di eseguire questo script caricare il file nginx-default.conf in /tmp/nginx.conf

NODEUSER="onit"
if [ $# -eq 0 ]; then
	echo "Usage: setup.sh nodeuser"
	exit -1
else
	NODEUSER=$1
fi

timedatectl set-timezone Europe/Rome

######## install nginx, node and deps
# installo curl. Dovrebbe essere gia' installato ma non si sa mai
apt install -y curl

# vado nella mia home e setto i repository di node(default v14, per altre versioni cambiare _16.x con _18.x)
cd ~
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
chmod +x nodesource_setup.sh
./nodesource_setup.sh

# install di pacchetti vari (tra cui gcc e python per poter compilare le dipendenze node)
apt install -y nodejs gcc g++ make nginx python3
apt autoremove -y

# setup servizio nginx come attivo al boot
systemctl enable nginx.service

#install node-gyp (per compilazione pacchetti nativi node)
npm install -g node-gyp

# install pm2
npm install pm2@5.1.2 -g

######## setup nginx
# per prima cosa creo il file geo_dyn che serve per la modalità maintenance
touch /etc/nginx/geo_dyn.conf
chown www-data:www-data /etc/nginx/geo_dyn.conf
chmod 755 /etc/nginx/geo_dyn.conf
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