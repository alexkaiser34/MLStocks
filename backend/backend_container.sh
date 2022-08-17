#!/bin/bash

ENV_DIR="../env"

goToEnv(){
    cd ../env

    ls -al | grep ".env" > /dev/null 2>&1

    if [ $? == 0 ]
    then
        ENV_DIR=$PWD
    else
        printf "\nMust run in env dir"
        exit -1
    fi
}

build_img(){
    docker pull alexkaiser34/stock-app-backend:latest
}



run_install(){
    docker run --rm --name stock-backend \
        --network="host" \
        -v $ENV_DIR:/home/myuser/env \
        alexkaiser34/stock-app-backend:latest --install
}

run_container(){
    docker run --name stock-backend \
        --network="host" \
        -d \
        --restart unless-stopped \
        -v $ENV_DIR:/home/myuser/env \
        alexkaiser34/stock-app-backend:latest --live_data
}

# remove previous containers and images for reinstallation
docker rm -f stock-backend > /dev/null 2>&1
docker rmi -f alexkaiser34/stock-app-backend:latest > /dev/null 2>&1

printf "\n#################################### LOADING BACKEND DOCKER IMG #####################################"
printf "\n"
printf "\n"

build_img
goToEnv

printf "\n#################################### INSTALLING STOCK DATA #####################################"
printf "\n"
printf "\n"

run_install

printf "\n#################################### RUNNING CONTAINER #####################################"
printf "\n"
printf "\n"

run_container

printf "\n#################################### SUCCESS ################################################"
