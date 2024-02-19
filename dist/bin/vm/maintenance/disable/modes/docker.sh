#!/bin/bash

# Nota: questi valori sono di esempio, vanno sostituiti con i valori corretti
APPUSER=""
NGINXMAINTENANCEVOLUMEDIR=""
NGINXMAINTMODEVOLUMEDIR=""

if [ $# -ne 3 ]; then
    echo "ERROR: You must pass APPUSER NGINXMAINTENANCEVOLUMEDIR NGINXMAINTMODEVOLUMEDIR values"
	echo "Usage: docker.sh APPUSER NGINXMAINTENANCEVOLUMEDIR NGINXMAINTMODEVOLUMEDIR"
	exit -1
else
	APPUSER=$1
    NGINXMAINTENANCEVOLUMEDIR=$2
    NGINXMAINTMODEVOLUMEDIR=$3
fi

# sed '/1.2.3.4/d' ip.txt > ip2.txt

# il maintenance mode lo si applica facendo touch di questo file.
# NGINX è preconfigurato per dare http 503 con redirect verso il portale di
# maintenance se trova questo file.
# NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
rm -f $NGINXMAINTMODEVOLUMEDIR/maintmode

# ATTENZIONE: questo comando presuppone che il container docker contenga il nome "nginx"
# Non è matematico che ci sia solo questo ma se ci sono 2 nginx forse c'è qualcosa di strano
NGINX_CONTAINER=`sudo docker ps -f "name=nginx" | grep nginx | awk '{print $1}'`
sudo docker exec $NGINX_CONTAINER /usr/sbin/nginx -s reload