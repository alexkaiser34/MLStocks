#!/bin/bash

NAME=""
PASSWORD=""

installDependencies(){
    printf "\n###################### Installing dependencies ############################\n\n"
    sudo apt-get install -y ca-certificates curl gnupg lsb-release > /dev/null 2>&1

    sudo mkdir -p /etc/apt/keyrings > /dev/null 2>&1
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg > /dev/null 2>&1

    echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null 2>&1
}
validateScriptPath(){

    # ensure the user is running as root, needed for permissions
    if [ "$USER" != "root" ];
    then
        printf "\nthis script must be run as root\n"
        exit -1
    fi

    # ensure user is executing the script from the root directory of the project
    if [ "$(echo "${BASH_SOURCE[0]}" | awk -F'/' '{print NF-1}')" != "1" ];
    then
        printf "\nMust execute script in root directory of project\n"
        exit -1
    fi
}

setupEnv(){

    # remove previous env, give user directions

    printf "\nSetting up your environment. You will be asked to enter a username and password.\n
    Then, you will enter an API key for the finnhub financial API.\n"

    rm -f env/.env
    printf "\nPlease enter a username:\n"
    read username

    NAME="$username"

    printf "\nPlease enter a password:\n"
    read password

    PASSWORD="$password"

    printf "\nGenerating an API token\n"
    while [ 1 ];
    do
        printf "\nPlease go to the following link: https://finnhub.io/ , and click on Get Free API key\n"
        printf "\nAfter signing up, copy and paste API key below\n"
        read apiKey

        res=$(curl -s -d -w "https://finnhub.io/api/v1/stock/symbol?exchange=US&token=$apiKey")
        if [[ $res =~ "API" ]];
        then
            printf "\n\n invalid key entered. Please try again\n\n"
        else
            printf "\nSuccessful API key entered\n"
            break
        fi
    done
    printf "ORG=\"$username\"" >> ./env/.env
    printf "\nAPI_KEY=\"$apiKey\"" >> ./env/.env
    printf "\nBUCKET=\"stock_data\"" >> ./env/.env
}

printf "\n\n"
printf "NOTE: This install script will erase all previous env configs and all previous data!! (if you have installed before)\n
    This will also install and reconfigure docker\n
    Press C then enter to continue\n"

read cont

if [ "$cont" == "C" ]
then
    ######################################## Preinstall ##########################
    printf "\n ####################### Preinstallation Process ####################"
    validateScriptPath
    installDependencies
    setupEnv

    ######################################## Install ###############################
    printf "\n ####################### Installation Process ####################"

    cd scripts
    ./influxdb_container.sh $NAME $PASSWORD
    # cd ..
    ./backend_container.sh

    printf "\n Backend Setup Succesfully!!!"
    printf "\n"
    # printf "\n Setting up frontend"

    # cd ../frontend
    # dpkg -r ml-stocks > /dev/null 2>&1
    # rm -rf /opt/MLStocks > /dev/null 2>&1
    # dpkg -i ml-stocks_0.1.0_amd64.deb
    # cd ..
    # cp env/.env /opt/MLStocks

    printf "\n\n################# Installation completed Succesfully ###################\n\n"
else
    printf "\nInstallation aborting!!\n"
    exit -1
fi
