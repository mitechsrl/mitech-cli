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

# vado nella mia home
cd ~
# installo alcuni pacchetti preliminari
apt install -y curl gnupg apt-transport-https ca-certificates software-properties-common

# Aggiungo repo per node.
NODE_MAJOR=18
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# install di pacchetti vari (tra cui gcc e python per poter compilare le dipendenze node)
sudo apt-get update
apt install -y nodejs gcc g++ make nginx python3
apt autoremove -y

# setup servizio nginx come attivo al boot
systemctl enable nginx.service

#install node-gyp (per compilazione pacchetti nativi node)
npm install -g node-gyp

# install pm2
npm install pm2@5.3.0 -g

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