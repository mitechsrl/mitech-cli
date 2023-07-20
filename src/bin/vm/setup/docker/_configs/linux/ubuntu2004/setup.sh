#!/bin/bash

APPUSER="onit"
ADMINUSER="azureuser"
if [ $# -ne 2 ]; then
    echo "ERROR: You must pass both app and admin usernames as 1st and 2nd param."
	echo "Usage: setup.sh appusername adminusername"
	exit -1
else
	APPUSER=$1
    ADMINUSER=$2
fi

timedatectl set-timezone Europe/Rome

#### installo vari pacchetti
apt install -y curl apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt install -y docker-ce docker-ce-cli

#### enable service on boot
systemctl enable docker

#### crea utente dedicato a apps. NOTA: non gli si assegna alcuna password.
#### L'utente non potrà accedere via ssh.
useradd -m $APPUSER -s /usr/bin/bash
# creo la dir di destinazione delle app di onit (e lo assegno all'user $APPUSER)
mkdir /home/$APPUSER/apps
chown $APPUSER:$APPUSER /home/$APPUSER/apps
chmod 755 /home/$APPUSER/apps

#### Aggiunto sia ADMINUSER che APPUSER al gruppo docker, in modo da potergli far fare le operazioni
#### Senza arzigogoli strani di permessi
usermod -a -G docker $APPUSER
usermod -a -G docker $ADMINUSER

echo "Aggiungo righe sudoers"
#### L'utente ADMINUSER può ricaricare docker cons sudo senza che gli venga richiesta password
#### SUPERATTENZIONE! una riga errata nel file /etc/sudoers fotte il sistema!
echo "$ADMINUSER ALL = NOPASSWD: /usr/bin/docker compose up -d --remove-orphans" >> /etc/sudoers

## Già che ci siamo installiamo anche node. Non serve, ma se dobbiamo fare degli script
## ci potrebbe essere utile. Installo la versione 18
cd ~
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
chmod +x nodesource_setup.sh
./nodesource_setup.sh
apt install -y nodejs

# clean finale
apt autoremove -y