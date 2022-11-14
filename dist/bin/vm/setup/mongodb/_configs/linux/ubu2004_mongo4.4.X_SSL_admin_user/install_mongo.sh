#!/bin/bash

PWD=`pwd`
# first param is mongo path. Must be set always, use default in case you don0t want to change the path
if [[ $1 = "default" ]]
then
  MONGOPATH="default"
else
  MONGOPATH=$1
fi

#Remove all old stuff
#apt-get remove --purge mongodb* -y;
#rm -rf /etc/mongodb/;
#rm -rf /etc/mongod.conf;
#rm -rf /var/lib/mongodb/

# setup repo & install
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
apt-get update
apt-get install -y mongodb-org
systemctl daemon-reload

# create the ssl key. this will not prompt for data
openssl rand -base64 48 > /tmp/passphrase.txt
openssl genrsa -aes128 -passout file:/tmp/passphrase.txt -out /tmp/server.key 2048
openssl req -new -passin file:/tmp/passphrase.txt -key /tmp/server.key -out /tmp/server.csr -subj "/C=IT/O=mitechsrl/OU=Integration/CN="
openssl rsa -in /tmp/server.key -passin file:/tmp/passphrase.txt -out /tmp/mongodb-cert.key
openssl x509 -req -days 46500 -in /tmp/server.csr -signkey /tmp/mongodb-cert.key -out /tmp/mongodb-cert.crt

#NOTE: this will prompt for data
#openssl req -newkey rsa:2048 -new -x509 -days 365000 -nodes -out mongodb-cert.crt -keyout mongodb-cert.key

mkdir /etc/mongodb
cat /tmp/mongodb-cert.key /tmp/mongodb-cert.crt > /etc/mongodb/mongodb.pem
chmod 744 /etc/mongodb/mongodb.pem
rm /tmp/mongodb-cert.key
rm /tmp/mongodb-cert.crt
rm /tmp/server.key
rm /tmp/server.csr
rm /tmp/passphrase.txt

# replace mongodb bind address to be accessed remotely. Auth will be added later
sed -i 's/127\.0\.0\.1/0.0.0.0/' /etc/mongod.conf

HAVESSL=`cat /etc/mongod.conf | grep requireSSL |  wc -l`
if [[ $HAVESSL -eq 0 ]]
then
# add ssl config
sed -i "s/^net\:$/net:\n  ssl:\n    mode: requireSSL\n    PEMKeyFile: \/etc\/mongodb\/mongodb.pem/" /etc/mongod.conf
fi

if [[ $MONGOPATH = "default" ]]
then
echo "Mongo path is default"
else
echo "Mongo path is $MONGOPATH";
mkdir $MONGOPATH
chmod 777 $MONGOPATH
sed -i "s#dbPath:.*#dbPath: $MONGOPATH#g" /etc/mongod.conf
fi

# sed "s/dbPath:.*/dbPath: \/demo/g" ./mongod.cfg
# launch service
systemctl start mongod.service

echo "Aspetto 20 secondi per avvio mongodb"; sleep 20

#reset cwd for security (make next step easier)
cd $PWD;
# this will create users and change the admin password
mongo --ssl --sslAllowInvalidCertificates < /tmp/mongodbUsers.js

# finally set the auth enabled
sed -i "s/#security\:/security:\n  authorization: \"enabled\"/" /etc/mongod.conf

#restart the service to apply all the confsudo igs
systemctl restart mongod.service

if [[ $MONGOPATH = "default" ]]
then
echo "Mongo path is default. No permission change"
else
echo "Fix permissions to $MONGOPATH";
chown mongodb:mongodb $MONGOPATH
chmod 700 $MONGOPATH
fi

# survive to reboots
systemctl enable mongod
