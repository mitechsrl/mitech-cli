#!/bin/bash

APPUSER="onit"
NGINXMAINTENANCEVOLUMEDIR="/home/onit/apps/nginx/maintenance"
NGINXMAINTMODEVOLUMEDIR="/home/onit/apps/nginx/maintmode"
if [ $# -ne 3 ]; then
     echo "ERROR: You must pass APPUSER NGINXMAINTENANCEVOLUMEDIR NGINXMAINTMODEVOLUMEDIR values"
	echo "Usage: docker.sh APPUSER NGINXMAINTENANCEVOLUMEDIR NGINXMAINTMODEVOLUMEDIR"
	exit -1
else
	APPUSER=$1
    NGINXMAINTENANCEVOLUMEDIR=$2
    NGINXMAINTMODEVOLUMEDIR=$3
fi


echo "Scompatto files portale amministrazione"

mkdir -p /tmp/maintenance
rm -rf /tmp/maintenance/*
tar -xf /tmp/maintenance.tar.gz -C /tmp/maintenance
cp /tmp/maintenance/* $NGINXMAINTENANCEVOLUMEDIR
chown -R $APPUSER:$APPUSER $NGINXMAINTENANCEVOLUMEDIR
sudo chmod -R 755 $NGINXMAINTENANCEVOLUMEDIR

# il maintenance mode lo si applica facendo touch di questo file.
# NGINX è preconfigurato per dare http 503 con redirect verso il portale di
# maintenance se trova questo file.
# NOTA: nginx usa l'estensione geo per lasciare attivo il portale per alcuni indirizzi ip.
touch $NGINXMAINTMODEVOLUMEDIR/maintmode


echo "Reload nginx..."
docker exec "nginx-proxy" /usr/sbin/nginx -s reload