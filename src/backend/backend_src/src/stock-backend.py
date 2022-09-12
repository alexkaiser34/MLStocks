from datetime import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
import os
import time
import pandas as pd
from influx_db import InfluxClient, QueryHelper
from MachineLearning import MachineLearning
from api import FinnhubClient, Finnhub_websocket
from MarketOpen import Market_open
import argparse
import threading

'''
Main class of the backend tool.  We will add two options for now.
    --install
        - handle the installation process by adding 1 year of complete data for each stock.
            Spawns 4 threads to speed up installation, kills each friend after method completes.
    --live_data
        - handles the real time data functionality by starting a websocket.
            Spawns 5 threads that take care of hourly and daily updates,
            real time price updates, and machine learning.
'''
class Stock_Backend:

    # Instatiate all objects, load in .env, define supported stocks, define threads
    # Install = True should only be used on initial install of application
    def __init__(self, supported_stocks, install=False):
        
        # parse the .env to grab data relevant to finnhub and influx clients
        load_dotenv() 
        self.token = os.getenv('TOKEN')
        self.org = os.getenv('ORG')
        self.bucket = os.getenv('BUCKET')
        self.api_key = os.getenv('API_KEY')

        # function returns whether or not the market is open
        self.isMarketClosed = Market_open.isMarketClosed

        # determine if we are installing
        self.install = install

        # variable to define list of supported stocks
        self.supported_stocks = supported_stocks
        
        # Influx Client --> Will perform all communications with influxdb
        self.influx_client = InfluxClient.InfluxClient(
            token=self.token, 
            org=self.org, 
            bucket=self.bucket
        )

        # Finnhub Client --> Will perform all communications with finnhub API
        self.finnhub_client = FinnhubClient.FinnhubClient(
            api_key=self.api_key, 
            db_client=self.influx_client
        )

        # Query Helper --> Class to make it easier to query from influxdb
        self.query_helper = QueryHelper.QueryHelper(
            bucket=self.bucket,
            db_client=self.influx_client
        )

        # Machine Learning --> Will perform all machine learning associated with each stock
        self.machineLearning = MachineLearning.MachineLearning(
            influx_client=self.influx_client, 
            query_helper=self.query_helper
        )

        # Finnhub Websocket --> Will handle the real time price updates via the finnhub websocket
        self.finnhub_websocket = Finnhub_websocket.Finnhub_websocket(
            token=self.api_key, 
            db_client=self.influx_client, 
            query_helper=self.query_helper,
            supported_stocks=self.supported_stocks, 
            isMarketClosed=self.isMarketClosed
        )

        '''
        Dictionary of threads, definition determined by install bool
        Install: 4 threads
            StockDataInstall --> Perform all finnhub api endpoints besides technical indicators
            ProfileINstall --> Perform updating the compnay profile, requires finnhub and yfinance
            TechnicalIndicatorInstall --> Perform all finnhub technical indicator endpoints
                Note: This has its own thread because of the response time of this API endpoint
            MachineLearningInstall --> Perform all machine learning for a given stock

        Regular: 5 threads
            CompanyDaily --> Performs updates for stock data once a day
                Data Updated: Profile, financials, earnings, buy hold
            CompanyHourly --> Performs updates for stock data once an hour (some needs to be updated more than others)
                Data Updated: Company News, Technical Indicators
            MarketNews --> Performs updates on general market news every 5 minutes
            MachineLearning --> Performs machine learning daily on each supported stock
                Note: Makes predictions for 6 months at the moment (with day precision)
            StockPrice --> Starts the websocket to handle the real time stock pricing functionality
        '''
        self.threads = {
            'CompanyDaily': threading.Thread(target=self.daily_company_data),
            'CompanyHourly': threading.Thread(target=self.hourly_company_data),
            'MarketNews': threading.Thread(target=self.add_market_news),
            'MachineLearning': threading.Thread(target=self.add_machine_learning),
            'StockPrice': threading.Thread(target=self.track_live)
        } if not install else {
            'StockDataInstall': threading.Thread(target=self.StockDataInstall),
            'ProfileInstall': threading.Thread(target=self.ProfileInstall),
            'TechnicalIndicatorInstall': threading.Thread(target=self.TechnicalIndicatorInstall),
            'MachineLearningInstall': threading.Thread(target=self.MachineLearningInstall)
        }

    '''
    Handle the Machine Learning Installation feature
    Performs all ML calculations for each stock.
    Runs on thread "MachineLearningInstall"
    '''
    def MachineLearningInstall(self):
        # sleep for 5 minutes, let data flow in before learning
        time.sleep(60*2)
        for ticker in self.supported_stocks:
            print('Machine learning for ' + ticker, flush=True)
            try:
                self.machineLearning.StockPriceLearning(
                        ticker=ticker,
                        precision='D',
                        n_future=180,
                        plot=False,
                        full_data=True
                    )
                time.sleep(1)
            except Exception as e:
                print(e)
                print('unable to add machine learning for ' + ticker)

        return

    '''
    Handle the Technical Indicators and ML Installation Feature
    Gather a years worth of Technical Indicator Data from finnhub api endpoints.
    Note: we need to run the ML after this so it has data to learn on
    Runs on thread "TechnicalIndicatorMLInstall"
    '''
    def TechnicalIndicatorInstall(self):
        end = int(datetime.strptime((datetime.now()).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())
        start = int(datetime.strptime((datetime.now() - relativedelta(days=364)).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())

        # resolution = 30 is weird, use D
        for ticker in self.supported_stocks:
            print('Tech install for ' + ticker, flush=True)
            res = self.finnhub_client.TechnicalIndicators(
                    ticker=ticker,
                    start=start,
                    end=end,
                    resolution='D'
                )
            time.sleep(1 if res == 0 else 15) 
        
        print('Should be existing tech install')
        return

    '''
    Handles the company profile install feature
    Performs company profile update with finnhub API and yfinance.
    Note: Runs on its own thread to due to long response times from yfinance.
    Runs on thread "ProfileInstall"
    '''
    def ProfileInstall(self):
        for ticker in self.supported_stocks:
            print('Adding profile for ' + ticker, flush=True)
            res = self.finnhub_client.company_profile(ticker=ticker)
            time.sleep(1 if res == 0 else 15)
        print('should be exiting profile install ')
        return

    '''
    Handles all other stock data install feature
    Performs all other API endpoints from finnhub.
    Runs on thread "StockDataInstall"
    '''
    def StockDataInstall(self):

        # Keep news datetimes in str format, endpoint expects it that way
        endNews = datetime.now().strftime('%Y-%m-%d')
        startNews = (datetime.now() - relativedelta(weeks=1)).strftime('%Y-%m-%d')
        
        end = int(datetime.strptime((datetime.now()).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())
        start = int(datetime.strptime((datetime.now() - relativedelta(days=364)).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())

        self.finnhub_client.MarketNews()
        time.sleep(1)

        for ticker in self.supported_stocks:
            print('Installing stock data for ' + ticker, flush=True)
            res = self.finnhub_client.StockPriceWrite(
                ticker = ticker, 
                start=start,
                end=end
            )

            time.sleep(1 if res == 0 else 15)
            
            self.finnhub_client.company_news(
                ticker=ticker, 
                start=startNews,
                end=endNews
            )

            time.sleep(1)

            res = self.finnhub_client.buy_hold(ticker=ticker)

            time.sleep(1 if res == 0 else 15)

            res = self.finnhub_client.company_financials(ticker=ticker)

            time.sleep(1) 

            res = self.finnhub_client.earnings_calendar(ticker=ticker)

            time.sleep(1)

        return
        

    '''
    Start the websocket, update stock prices real time.
    This function simply starts the websocket, and ensures
    it only run when the market is open. Should be running all the time.
    Runs on thread "StockPrice"
    '''
    def track_live(self):
        while True:
            if not self.isMarketClosed():
                self.finnhub_websocket.start_socket()
                print('closing socket')
                time.sleep(10)
            else:
                print('stock market closed')
                time.sleep(10)

    '''
    Handle the daily updates for given stock features that only need 
    to be updated daily.  We can avoid unecessary tasks by only updating
    things once a day that do not change often.
    Runs on thread "CompanyDaily"
    '''
    def daily_company_data(self):
        while True:
            for ticker in self.supported_stocks:
                print('Adding daily company data for ' + ticker, flush=True)

                res = self.finnhub_client.company_profile(ticker=ticker)
                
                # we do this in case an exception occurs, may need to give the 
                # API a break because we may be exceeding the rate limit
                time.sleep(1 if res == 0 else 15)

                res = self.finnhub_client.company_financials(ticker=ticker)
                time.sleep(1 if res == 0 else 15)

                res = self.finnhub_client.earnings_calendar(ticker=ticker)
                time.sleep(1 if res == 0 else 15)

                res = self.finnhub_client.buy_hold(ticker=ticker)
                time.sleep(1 if res == 0 else 15)
                
            time.sleep(60*60*23)

    '''
    Handle the hourly updates for given stock features that need to be updated
    more frequently.  We will run this thread once an hour for more volatile data.
    Runs on thread "companyHourly"
    
    Note: We do not need to query a whole year each time.
        Only do that on install, never should be a case where that much is needed
    '''
    def hourly_company_data(self):
        while True:
            for ticker in self.supported_stocks:
                endNews = datetime.now().strftime('%Y-%m-%d')
                startNews = (datetime.now() - relativedelta(days=1)).strftime('%Y-%m-%d')
                end = int(datetime.strptime((datetime.now()).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())
                start = int(datetime.strptime((datetime.now() - relativedelta(weeks=1)).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S').timestamp())
                
                print('Adding hourly company data for ' + ticker, flush=True)
                
                self.finnhub_client.company_news(
                    ticker=ticker,
                    start=startNews,
                    end=endNews
                )

                time.sleep(1)
                
                # dont need to update indicators when market is closed
                if not self.isMarketClosed():
                    res = self.finnhub_client.TechnicalIndicators(
                        ticker=ticker,
                        start=start, 
                        end=end, 
                        resolution='30'
                    )
                    time.sleep(1 if res == 0 else 15)

            time.sleep(60*60)

    '''
    Handle updates for general market news.
    This changes quite often so we will run this
    thread every 5 minutes for now.
    Runs on thread "MarketNews"
    '''
    def add_market_news(self):
        while True:
            print('Adding market news', flush=True)
            self.finnhub_client.MarketNews()
            time.sleep(60*5)

    '''
    Handle all machine learning calculations for each stock.
    We will run this function once a day, and throw a new price prediction
    out for the next 6 months. At the moment, it is setup for daily precision.
    Can handle hourly precision, just takes longer, may use in the future.
    Runs on thread "MachineLearning"

    Note:
        We only need to update this thread once a day. Cant see
        why it would need to run more than that.
    '''
    def add_machine_learning(self):
        while True:
            for ticker in self.supported_stocks:
                print('Adding Machine learning for ' + ticker)
                self.machineLearning.StockPriceLearning(
                    ticker=ticker,
                    precision='D',
                    n_future=180,
                    plot=False,
                    full_data=True
                )
                time.sleep(5)

            time.sleep(60*60*23)

    '''
    LETS. GO.
    Main method to run regularly, starts all 5 threads.
    This method is called when the --live_data arg
    is passed from the command line.
    '''
    def lets_go(self):
        for thread in self.threads:
            print('starting ' + thread)
            self.threads[thread].start()

    '''
    Installation
    Main method to run for installation, starts 4 install threads.
    This method is called when the --install arg
    is passed from the command line.
    '''
    def installation(self):
        for thread in self.threads:
            print('starting thread ' + thread)
            self.threads[thread].start()

    
'''
Basic function to parse CL arguments
    --install, installation process, only run once
    --live_data, real time data functionality, should be running all the time
'''
def parsed_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--install", help='Add all historical data to provided stock ticker', action='store_true', default=argparse.SUPPRESS)
    parser.add_argument("--live_data", help='Provide live data on provided stock ticker', action='store_true', default=argparse.SUPPRESS)
    args = parser.parse_args()
    return args


'''
Main method of the backend

1. Parse in supported stocks from supported_stocks.txt
2. Parse CL Arguments
    --install , installation process, add 1 year of complete data for all supported stocks
    --live_data, support stocks real time, should be running at all times
'''
if __name__ == '__main__':

    # parse in CL args
    args = parsed_args()

    # parse supported stock list
    supported_stocks = [i.strip() for i in open("supported_stocks.txt").readlines()]

    # installation
    if hasattr(args,'install'):
        backend = Stock_Backend(
            supported_stocks=supported_stocks,
            install=True
        )
        backend.installation()

    # live data
    elif hasattr(args,'live_data'):
        backend = Stock_Backend(
            supported_stocks=supported_stocks,
            install=False
        )
        backend.lets_go()