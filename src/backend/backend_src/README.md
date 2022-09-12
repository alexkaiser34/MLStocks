# MLStocks Backend

## Backend Layout

📦backend \
 ┣ 📂backend_src \
 ┃ ┣ 📂src \
 ┃ ┃ ┣ 📂MachineLearning \
 ┃ ┃ ┣ 📂MarketOpen \
 ┃ ┃ ┣ 📂api \
 ┃ ┃ ┣ 📂influx_db \
 ┃ ┃ ┣ 📜.env \
 ┃ ┃ ┣ 📜__init__.py \
 ┃ ┃ ┣ 📜stock-backend.py \
 ┃ ┃ ┗ 📜supported_stocks.txt \
 ┃ ┣ 📜Dockerfile \
 ┃ ┣ 📜README.md \
 ┃ ┣ 📜entry.sh \
 ┃ ┣ 📜requirements.txt \
 ┃ ┗ 📜setup.py \
 ┗ 📂installation \
 ┃ ┣ 📂env \
 ┃ ┃ ┣ 📜.env \
 ┃ ┃ ┗ 📜supported_stocks.txt \
 ┃ ┣ 📂images \
 ┃ ┣ 📂scripts \
 ┃ ┃ ┣ 📜backend_container.sh \
 ┃ ┃ ┗ 📜influxdb_container.sh \
 ┃ ┣ 📜README.md \
 ┃ ┗ 📜install.sh \

## Overview
The main backend of MLStocks utilizes two major components.

1. <a href="https://finnhub.io/">Finnhub API</a>
2. <a href="https://www.influxdata.com/">Influx DB</a> 

The backend makes request to the Finnhub API, and writes the responses to 
an influx database.  On top of that, a LSTM machine learning model is used to
make stock price predictions. The main python script that controls the backend
is called `stock-backend.py`.  The backend is built into a docker image, which is then used
in running a container that runs in the background forever.  Follow these tips 
to setup your own container when developing locally.

## Installing Docker

To correctly install and configure docker,
follow this <a href="https://docs.docker.com/engine/install/ubuntu/">guide</a>.
After installing docker, add the current user to the group to run `docker` without
`sudo` by performing the following.
```
sudo groupadd docker
sudo usermod -aG docker $USER
```
Docker should now be ready to use.

## Running the Application when Developing
To run the backend when developing without using docker, do the following. \
**NOTE**: Python 3.6.10 was used during development.

```
cd src
python3 -m venv venv
source venv/bin/activate
pip3 install .
python3 stock-backend.py --live_data
```
This sequence should successfully create a virtual environemt and install necessary packages. \
To test and run the application in the future, simply source the venv and run `python3 stock-backend.py --live_data`.


## Building

To build the backend docker image, navigate to this directory
and run the following command.
```
docker build -t <tag_name> .
```
This should build a docker images which you can then view by running `docker images`.

## Running the container

The Docker container is designed to be run in the background forever. The following commands
are used when running the container.

### Initial Install (run only once)
Run this container when initially installing the backend to load the database with data.

```
docker run --rm --name stock-backend \
        --network="host" \
        -v <path_to_env_folder>:/home/myuser/env \
        <docker_image> --install
```
This will run the container once, then remove it when complete.

#### Env folder
Replace `<path_to_env_folder>` with the path to your own env folder.  
This folder will be used as a volume for the docker container.
Your env folder should have the following contents.

📦env \
 ┣ 📜.env \
 ┗ 📜supported_stocks.txt 

The `.env` file should have your database token, organization, and finnhub API key.

### Main Application Container
The main application that runs in the background forever can then be run with the following command.
```
docker run --name stock-backend \
        --network="host" \
        -d \
        --restart always \
        -v <path_to_env_folder>:/home/myuser/env \
        alexkaiser34/stock-app-backend:latest --live_data
```
This container will constantly update the database with real time stock data in the background.

## Useful Tips

1. When building on a machine with ARM architecture, make the following change to `requirements.txt`.

```diff
- tensorflow==2.9.1
+ tensorflow-aarch64
```

1. The scripts located in the `installation` directory provide examples of how to build and package the backend.
1. After building a docker image, you can run the install script (`install.sh`) in the `installation` directory after changing the tag names in the scripts to your custom docker image tag. 
