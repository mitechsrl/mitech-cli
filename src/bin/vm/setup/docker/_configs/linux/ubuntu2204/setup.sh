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

# installo alcuni pacchetti preliminari
apt install -y curl gnupg apt-transport-https ca-certificates software-properties-common

# Aggiungo repo per node. Sarà da installare perchè alcuni comandi eseguono node
# per fare delle operazioni complesse
# Aggiungo repo per node.
NODE_MAJOR=18
if ! [ -x "$(command -v node)" ]; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
else
    echo "Node already installed. Skip this step."
fi

# Aggiungo repo ufficiale docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

# install node e docker
sudo apt-get update
apt install -y nodejs docker-ce docker-ce-cli

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