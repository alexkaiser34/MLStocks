<p align="center">
    <img src="images/MLIcon_Horizontal.png"></img>
<!-- ![Alt text](images/MLIcon_Horizontal.png?raw=true "Title") -->
</p>


## MLStocks Local Environment Setup

### Overview
MLStocks is a desktop application built with Electron and React JS (using typescript). It displays real time stock data with
machine learning price predictions.  At the moment, up to 50 stocks are supported.  The application
contains three pages that the user can navigate between including a home page, a search page, and a stock charts page.
Installing this application with this configuration spawns the backend of the application on your local machine.

### System Requirements
This version of the application requires a linux machine with x86-64 architecture (such as Ubuntu).

## How it works
After installing the application, two docker containers will run in the background forever.  One container uses a
docker image that runs the main python script of the application, which uses the finnhub API to retrieve stock data, 
performs machine learning, and writes the data to an influx database. The other container runs the influx database 
that is hosted on your local machine, which can be accessed in a browser via the url provided in the
`Installing the Application` section.

## Advantages 
There are several advantages to using this configuration of the application.
- Customization of which stocks are supported
- Increased speed and performance
- Access to database
- Personal Finnhub API key


## Installing the Application

To install the application, simply run `sudo ./install.sh` from the root of the project.

The script will ask for a username, password, and API key. The username and password
can be used to access your influx database, running on your local host (port 8086).
Simply navigate to http://localhost:8086/ to view the data in your database.

The API key will be generated at https://finnhub.io/.  This application utilizes the finnhub
financial API.

If installation was successful, to run the application, search for `MLStocks` in your installed applications.

## Customizing Supported Stocks
To select which stocks you would like to be supported, edit `env/supported_stocks.txt` before installation.  This file
contains a list of all supported stock tickers. Replace the list of tickers with any stock tickers you would like.  As of now, 
only 50 stocks can be supported at a time.


