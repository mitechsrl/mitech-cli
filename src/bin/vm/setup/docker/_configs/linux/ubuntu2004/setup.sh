#!/bin/bash

APPUSER="onit"
ADMINUSER="azureuser"
if [ $# -ne 2 ]; then
    echo "ERROR: You must pass both app and admin usernames as 1st and 2nd param."
	echo "Usage: setup.sh APPUSER ADMINUSER"
	exit -1
else
	APPUSER=$1
    ADMINUSER=$2
fi

# Vado nella mia home
cd ~

# Set timezone
timedatectl set-timezone Europe/Rome

# Aggiungo repo per node. Sarà da installare perchè alcuni comandi eseguono node
# per fare delle operazioni complesse
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
chmod +x nodesource_setup.sh
./nodesource_setup.sh

# installo vari pacchetti
apt install -y curl apt-transport-https ca-certificates software-properties-common nodejs
# Aggiungo repo ufficiale docker, poi installo docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt install -y docker-ce docker-ce-cli

# crea utente dedicato a apps. NOTA: non gli si assegna alcuna password,
# l'utente non potrà accedere via ssh.
useradd -m $APPUSER -s /usr/bin/bash
# creo la dir di destinazione delle app di onit (e lo assegno all'user $APPUSER)
mkdir /home/$APPUSER/apps
chown $APPUSER:$APPUSER /home/$APPUSER/apps
chmod 755 /home/$APPUSER/apps

# Aggiunto sia ADMINUSER che APPUSER al gruppo docker, in modo da potergli far fare le operazioni
# Senza arzigogoli strani di permessi
usermod -a -G docker $APPUSER
usermod -a -G docker $ADMINUSER

# echo "Aggiungo righe sudoers"
# L'utente ADMINUSER può ricaricare docker cons sudo senza che gli venga richiesta password
# SUPERATTENZIONE! una riga errata nel file /etc/sudoers fotte il sistema!
# echo "$ADMINUSER ALL = NOPASSWD: /usr/bin/docker compose up -d --remove-orphans" >> /etc/sudoers
# NOTA: Commentato perchè admin dovrebbe già avere nopasswd per tutti i comandi

# Abilito service docker al boot
systemctl enable docker

# clean finale
apt autoremove -y