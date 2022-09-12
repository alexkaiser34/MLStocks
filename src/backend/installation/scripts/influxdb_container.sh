#!/bin/bash

# https://medium.com/geekculture/deploying-influxdb-2-0-using-docker-6334ced65b6c
ls | grep "influxdb_container.sh" > /dev/null 2>&1

if [ $? != 0 ]
then
  echo "Must run the influxdb script in the same directory as the script"
  exit -1
fi

INFLUXDB_BUCKET=stock_data
INFLUXDB_ORG=$1
INFLUXDB_PASSWORD=$2


# remove previous configurations for reinstallation
rm -rf influxdb2
rm -f config.yml
docker rm -f influxdb > /dev/null 2>&1
docker rmi -f influxdb:2.0.7 > /dev/null 2>&1


# pull the image first
printf "\n\n################### Pulling influxdb image ################\n"
docker pull influxdb:2.0.7


printf "\n################### Creating config file ################\n"
# create config file
docker run --rm influxdb:2.0.7 influxd print-config > config.yml

printf "\n################### Creating container ################\n"
# create the container
docker run --name influxdb -d \
  -p 8086:8086 \
  --restart unless-stopped \
  --volume $PWD/influxdb2:/var/lib/influxdb2 \
  --volume $PWD/config.yml:/etc/influxdb2/config.yml \
  influxdb:2.0.7

printf "\n################### Wating for database to be ready... ################\n"

# wait until the database server is ready
until docker exec influxdb influx ping
do
  echo "Retrying..."
  sleep 5
done

# configure influxdb
printf "\n################### Configuring database ################\n"

docker exec influxdb influx setup \
  --bucket $INFLUXDB_BUCKET \
  --org $INFLUXDB_ORG \
  --password $INFLUXDB_PASSWORD \
  --username $INFLUXDB_ORG \
  --force

# update the retention policy
docker exec influxdb influx bucket update -i $(docker exec influxdb influx bucket list | \
  awk -v username=$INFLUXDB_BUCKET '$2 ~ username {print $1 " "}') -r 370d

# get the token
token=$(docker exec influxdb influx auth list | \
	awk -v username=$INFLUXDB_ORG '$5 ~ username {print $4}')

# copy to .env
printf "\nTOKEN=\"$token\"" >> ../env/.env

printf "\n\nSuccessfully created influx database container!!\n"

