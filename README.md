<p align="center">
    <img src="images/MLIcon_Horizontal.png"></img>
<!-- ![Alt text](images/MLIcon_Horizontal.png?raw=true "Title") -->
</p>

## About MLStocks

### Overview
MLStocks is a cross-platform desktop application built with Electron and React JS (using typescript). It displays real time stock data with
machine learning price predictions.  At the moment, up to 50 predefined stocks are supported.  The application
contains three pages that the user can navigate between including a home page, a search page, and a stock charts page.

### Technologies Used
The following is a list of all technologies used in this application.
1. <a href="https://www.electronjs.org/">Electron</a>
1. <a href="https://reactjs.org/">REACT JS</a> (using Typescript) 
1. <a href="https://www.docker.com/">Docker</a>
1. <a href="https://finnhub.io/">Finnhub API</a>
1. <a href="https://www.influxdata.com/">InfluxDB</a>

### Platforms Supported
<table>
    <tr>
        <td width="441" align="center"><h1 style="font-weight: 700;">macOS</h1></td>
        <td width="441" align="center"><h1 style="font-weight: 700;">Ubuntu</h1></td>
        <td width="441" align="center"><h1 style="font-weight: 700;">Windows</h1></td>
    </tr>
    <tr>
        <td width="441" align="center"><img style="display: inline-block" height="100" src="images/macLogo.png"></img>  </td>
        <td width="441" align="center"><img style="display: inline-block" height="100" src="images/ubuntuLogo.png"></img>  </td>
        <td width="441" align="center"><img style="display: inline-block" height="100" src="images/windowsLogo.png"></img>  </td>
    </tr>
</table>

1. <a href="https://www.apple.com/macos/monterey/">**macOS**</a>
    - tested on macOS High Sierra verison 10.13
1. <a href="https://ubuntu.com/">**Linux**</a>
    - tested on Ubuntu 20.04
    - NOTE: only linux distributions with x86-64 architecture (like ubuntu) are supported
1. <a href="https://www.microsoft.com/en-us/windows/windows-11">**Windows**</a>
    - tested on Windows 11


### Stock Metrics
The application displays different metrics for each stock including the following:
- Relative Strength Index 
- Momentum
- Rate of Change
- Weighted Moving Average
- Simple Moving Average
- Machine Learning Predictions (10 day, 30 day, 60 day, 180 day)
- Buy Hold Reccomendations
- Company Financials (volume, P/E ratio, 52 Week High, etc)
- Earnings Calendar (for the past year)

These metrics can all be viewed by clicking the measurements button included above each individual stock graph,
or in the expanded view of each stock.

### Stock Profiles
Each individual stock contains a variety of data to allow the user to learn more about the stock.
This profile includes a long decsription about what the company does, where they are located, and what
they sell.  It also includes individual company financials, buy hold reccomendations, earning calendars, and
individual company news.

### Different Application Pages
1. Home Page
    - This page is where the user is directed to when opening the application.  It contains
    the MLStocks logo along with a list of all supported stocks.  This list can be rearranged and 
    sorted in different ways when clicking on the `Sort By` button.
1. Search Page
    - The search page contains a search bar at the top where the user can look up stocks. When typing in
    the search bar, autosuggestions will appear in a dropdown below the bar.  Click on one of the autosuggestions
    to view the stock in expanded view.  This page also contains general market news that updates every 5 minutes which
    is displayed below the search bar.
1. Charts Page
    - The charts page contains all supported stocks in "compressed" view.  The "compressed" view shows
    the real time stock graph which the user can interact with.  These charts are laid out in a grid so the 
    user can visualize multiple stocks easily at the same time.  The expand button can be clicked on to expand
    the stock to full screen.

NOTE: For now, the settings page is under construction.

## Installation Instructions

### Linux
Install the debian package located in the linux directory.

### Windows
Install the exe file located in the windows directory.

### macOS
The macOS dmg file is located in the mac directory.  Since the file is slightly over 100 MB,
`git lfs` has to be used.  In order to install `git lfs`, follow this <a href="https://git-lfs.github.com/">guide</a>.
After `git lfs` is installed and the repository has been cloned, run the command `git lfs pull` from the root of the 
project.  This will pull in the full dmg file which can then be installed.

## Local Development Option
If you are experiencing problems or slow speeds with this applications, there is a configuration to install this application locally. 
This reporistory contains a `devel` branch.  This branch sets up the backend of the application on your local machine.
On installation, two docker containers spawn that run in the background forever. One container runs an influx database,
and the other runs the main python script, which constantly updates stock data. This option also allow you to customize which stocks
are supported (up to 50).

### System Requirements
A linux machine (x86_64 architecture) must be used when running the develop configuration of this application.
Development of the application was tested on a linux machine using Ubuntu 20.04.
