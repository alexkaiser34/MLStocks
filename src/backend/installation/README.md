

<p align="center">
    <img src="images/MLIcon_Horizontal.png"></img>
<!-- ![Alt text](images/MLIcon_Horizontal.png?raw=true "Title") -->
</p>


# Backend Installation Help

## backend directory

1. `backend_container.sh`
- This script pulls in a prebuilt docker container which installs and runs python backend.

1. `influxdb_container.sh`
- This script sets up an influx database on your local machine.


## env directory
This directory contains a list of supported stocks.  You can change this to add any ticker you 
would like to support (up to 50).  After installation, a `.env` file will be created containing
information about your local environment set up.

## Installing
`install.sh`
- To install the backend locally, simply run `sudo ./install.sh` and follow the instructions.
- **NOTE**: This assumes you have already setup a docker image.