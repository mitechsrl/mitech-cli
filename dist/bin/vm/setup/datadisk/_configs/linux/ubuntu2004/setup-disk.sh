#!/bin/bash

echo "Block device: $1"
PARTITION="$11"
echo "Partition: $PARTITION"
echo "Mount point: $2"

ALREADYMOUNTED=`cat /etc/fstab | grep "$2 " | wc -l`

if [[ "$ALREADYMOUNTED" == 1 ]]; then
    echo "ERRORE: mount point $2 non disponibile. Scegline uno diverso"
    exit 10
fi

# create partition and format it
sudo parted $1 --script mklabel gpt mkpart xfspart xfs 0% 100% 
sudo mkfs.xfs $PARTITION
sudo partprobe $PARTITION 
sudo mkdir $2

# Mount
sudo mount $PARTITION $2
sudo df -h | grep $2 

# get block id
BLOCKID=`blkid -s UUID -o value $PARTITION`
# prepara stringa da mettere in fstab
FSTAB="UUID=$BLOCKID   $2   xfs   defaults,nofail   1   2 "
# Aggiungi stringa in fstab
sudo sh -c "echo \"$FSTAB\" >> /etc/fstab"

# Final check: unmount the temporary mounted disk and remount using fstab definition
# if before == 1 then everything is ok
sudo umount $2
BEFORE=`df -h | grep $2 | wc -l`
sudo mount -a
AFTER=`df -h | grep $2 | wc -l`

echo "BEFORE=$BEFORE"
echo "AFTER=$AFTER"
exit 0