import finnhub
import time
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
import pandas as pd
from . import YfinanceClient
import pytz

'''
This class directs all communications with the 
finnhub api.  Different methods hit different API endpoints.
Each method takes the response, and sends it to influxdb.    

Note: 
    Each method has two try except blocks.
        The first is to catch exceptions from the finnhub or yfinance client
        The second is to catch exceptions from writing to influxdb

This is structured this way so one bad write or read does not cause
the whole thread to blow up. Some endpoints are more reliable than others,
so its a good idea to leave these blocks the way they are.
'''
class FinnhubClient:

    # instantiate objects, both yfinance and finnhub (influx is passed in)
    def __init__(self, api_key, db_client):
        self.db_client = db_client
        self.client = finnhub.Client(api_key=api_key)
        self.yfinance_client = YfinanceClient.YfinanceClient()

    '''
    Request and write a times worth of stock price data for provided ticker.
    Used on install, so usually a years worth.

    Params:
        ticker --> ticker for stock prices
        start --> start time to request from
        end --> end time to request too
    Returns:
        1 --> exception
        0 --> failure
    '''
    def StockPriceWrite(self, ticker, start, end):

        try:
            res = self.client.stock_candles(ticker, 'D', start, end)
            data_json = json.dumps(res, sort_keys=True, indent=4, separators=(',', ': '))

            df = pd.read_json(data_json)
            for i, row in df.iterrows():
                try:
                    self.db_client.write_data(["stock_prices,stock={ticker} price={open} {time}".format(
                            ticker=ticker,
                            open=format(df.loc[i].at["o"], ".3f"),
                            time=df.loc[i].at["t"]
                        )])
                except:
                    print('error writing stock prices influxdb for ' + ticker)
                    return 1
        except:
            print('error writing stock prices for ' + ticker)
            return 1
        return 0

    '''
    Request and write news associated with a provided ticker.
    
    Params:
        ticker --> ticker for news
        start --> start time to request from
        end --> end time to request too
    '''
    def company_news(self, ticker, start, end):
        try:
            res = self.client.company_news(ticker, _from=start, to=end)
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            if len(df.index) <= 1:
                print('No news for ' + ticker)
                print('retrying')
                time.sleep(1)
                start = (datetime.now() - relativedelta(weeks=1)).strftime('%Y-%m-%d')
                res = self.client.company_news(ticker, _from=start, to=end)
                j = json.dumps(res, indent=4)
                df = pd.read_json(j)
                if len(df.index) <= 1:
                    print('nobody talks about this stock')

            for i,rows in df.iterrows():
                try: 
                    self.db_client.write_data(["companyNews,stock={ticker} headline=\"{headline}\",summary=\"{summary}\",source=\"{source}\",newsImage=\"{image}\",newsUrl=\"{url}\" {time}".format(
                            ticker=ticker,
                            headline=str(df.iloc[i].at["headline"]).replace('"', ''),
                            summary=str(df.iloc[i].at["summary"]).replace('"', ''),
                            source=str(df.iloc[i].at["source"]).replace('"', ''),
                            image=str(df.iloc[i].at["image"]).replace('"', ''),
                            url=str(df.iloc[i].at["url"]).replace('"', ''),
                            time=int(datetime.strptime(str(df.loc[i].at["datetime"]), '%Y-%m-%d %H:%M:%S').timestamp())
                        )])
                except:
                    print('error writing company news influxdb for ' + ticker)
        except:
            print('error writing company news for ' + ticker)
        time.sleep(1)

    '''
    Request and write a company profile for associated stock.
    Communicates with both finnhub API and yfinance module.

    Params:
        ticker --> ticker for profile
    Returns:
        1 --> exception
        0 --> success
    '''
    def company_profile(self,ticker):
       
        try: 
            description = self.yfinance_client.get_description(ticker)
            res = self.client.company_profile2(symbol=ticker)

            try:
                self.db_client.write_data(["companyProfile,stock={ticker} name=\"{name}\",exchange=\"{exchange}\",ipo=\"{ipo}\",logo=\"{logo}\",weburl=\"{weburl}\",description=\"{description}\" {time}".format(
                            ticker=ticker,
                            name=str(res['name']),
                            exchange=str(res['exchange']),
                            ipo=str(res['ipo']),
                            logo=str(res['logo']),
                            weburl=str(res['weburl']),
                            description=str(description).replace('"', ''),
                            time=int(datetime.now().timestamp())
                        )])
            except:
                print('error writing profile influxdb for ' + ticker)
                return 1
        except:
            print('error writing profile for ' + ticker)
            return 1

        return 0

    '''
    Request and write buy/sell/hold ratings for an associated ticker.
    Determines the analyst ratings for buy, sell, and hold.

    Params:
        ticker --> ticker to gather buy hold data on
    Returns:
        1 --> exception
        0 --> success
    '''
    def buy_hold(self, ticker):
        try:
            res = self.client.recommendation_trends(ticker)
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try: 
                    self.db_client.write_data(["buyHold,stock={ticker} buy={buy},hold={hold},sell={sell},strongbuy={strongbuy},strongsell={strongsell} {time}".format(
                            ticker=ticker,
                            buy=df.iloc[i].at["buy"],
                            hold=df.iloc[i].at["hold"],
                            sell=df.iloc[i].at["sell"],
                            strongbuy=df.iloc[i].at["strongBuy"],
                            strongsell=df.iloc[i].at["strongSell"],
                            time=int(datetime.strptime(str(df.loc[i].at["period"]), '%Y-%m-%d').timestamp())
                        )])
                except:
                    print('error writing buy hold influxdb for ' + ticker)
                    return 1
        except:
            print('error writing buy hold for ' + ticker)
            return 1
        return 0

    '''
    Requests and writes earnings calendar values for associated ticker.
    Returns actual, estimate, surprise, and surprise percentage earnings.

    Params: 
        ticker --> ticker to gather earnings data on
    Returns:
        1 --> exception
        0 --> success
    '''
    def earnings_calendar(self, ticker):
        try:
            res = self.client.company_earnings(ticker)
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try:
                    self.db_client.write_data(["earningsCalendar,stock={ticker} Actual={Actual},Estimate={Estimate},Surprise={Surprise},Surprise_percentage={Surprise_percentage} {time}".format(
                            ticker=ticker,
                            Actual=format(df.iloc[i].at["actual"], ".2f"),
                            Estimate=format(df.iloc[i].at["estimate"], '.2f'),
                            Surprise=format(df.iloc[i].at["surprise"], '.3f'),
                            Surprise_percentage=format(df.iloc[i].at["surprisePercent"], '.2f'),
                            time=int(datetime.strptime((datetime.strptime((str(df.loc[i].at["period"])), '%Y-%m-%d')).strftime('%Y-%m-%d'), '%Y-%m-%d').timestamp())
                        )])

                except Exception as e:
                    print('cant write because time is')
                    print(str(datetime.strptime((datetime.strptime((str(df.loc[i].at["period"])), '%Y-%m-%d') + relativedelta(days=1)).strftime('%Y-%m-%d'), '%Y-%m-%d')))
                    return 1
        except:
            print('error writing earnings for ' + ticker)
            return 1
        return 0

    '''
    Requests and write general market news.
    This is not associated with a ticker, just general market news
    from the finnhub API endpoint.
    '''
    def MarketNews(self):
        try:
            res = self.client.general_news('general', min_id=0)
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            gmt = pytz.timezone('GMT')
            eastern = pytz.timezone('US/Eastern')
            for i,rows in df.iterrows():
                try: 
                    self.db_client.write_data(["marketNews,generalNews=MarketNews Category=\"{Category}\",Headline=\"{Headline}\",Summary=\"{Summary}\",Image=\"{Image}\",Source=\"{Source}\",Url=\"{Url}\" {time}".format(
                                Category=str(df.iloc[i].at['category']),
                                Headline=str(df.iloc[i].at['headline']),
                                Summary=str(df.iloc[i].at['summary']),
                                Image=str(df.iloc[i].at['image']),
                                Source=str(df.iloc[i].at['source']),
                                Url=str(df.iloc[i].at['url']),
                                time=int((datetime.strptime(str(df.iloc[i].at["datetime"]), '%Y-%m-%d %H:%M:%S')).timestamp())
                            )])
                except:
                    print('error writing market news influxdb')
        except:
            print('error writing market new')
        time.sleep(1)

    '''
    Requests and writes all financials associated with given ticker.

    Params:
        ticker --> ticker for financials
    Returns:
        1 --> exception
        0 --> success
    '''
    def company_financials(self, ticker):
        try:
            financials = {}
            basic = self.client.company_basic_financials(ticker, 'all')

            j = json.dumps(basic, indent=4)
            df = pd.read_json(j)

            candles = self.client.stock_candles(ticker, 'D', int((datetime.now() - relativedelta(weeks=1)).timestamp()), int(datetime.now().timestamp()))
            j1 = json.dumps(candles, indent=4)
            df1 = pd.read_json(j1)

            financials = {
                'peRatio': df.loc['peInclExtraTTM', 'metric'],
                'beta': df.loc['beta', 'metric'],
                'avgVolume': df.loc['10DayAverageTradingVolume', 'metric'],
                'high52': df.loc['52WeekHigh', 'metric'],
                'high52_date': df.loc['52WeekHighDate', 'metric'],
                'low52': df.loc['52WeekLow', 'metric'],
                'low52_date': df.loc['52WeekLowDate', 'metric'],
                'priceReturnDaily52': df.loc['52WeekPriceReturnDaily', 'metric'],
                'divYield': df.loc['currentDividendYieldTTM', 'metric'],
                'close': df1.iloc[-1].at['c'],
                'High': df1.iloc[-1].at['h'],
                'Low': df1.iloc[-1].at['l'],
                'Open': df1.iloc[-1].at['o'],
                'Volume': df1.iloc[-1].at['v'],
            }

            for measurement in financials:
                if financials[measurement] is None:
                    financials[measurement] = 0

            try: 
                self.db_client.write_data(["basicFinancials,stock={ticker} Close={Close},High={High},Low={Low},Open={Open},Volume={Volume},PEratio={PE},beta={beta},AverageVolume={avgVol},52WeekHigh={h52},52WeekHighDate=\"{h52_d}\",52WeekLow={l52},52WeekLowDate=\"{l52_d}\",52WeekDailyPriceReturn={pr_52},DividendYield={divYield} {time}".format(
                        ticker=ticker,
                        Close=financials['close'],
                        High=financials['High'],
                        Low=financials['Low'],
                        Open=financials['Open'],
                        Volume=financials['Volume'],
                        PE=financials['peRatio'],
                        beta=financials['beta'],
                        avgVol=financials['avgVolume'],
                        h52=financials['high52'],
                        h52_d=str(financials['high52_date']),
                        l52=financials['low52'],
                        l52_d=financials['low52_date'],
                        pr_52=financials['priceReturnDaily52'],
                        divYield=financials['divYield'],
                        time=df1.iloc[0].at['t']
                    )])
            except:
                print('error writing financials influxdb for ' + ticker)
                return 1
        except:
            print('error writing financials for ' + ticker)
            return 1
        return 0
    
    '''
    Main method to run that requests and writes all technical indicators
    for a given ticker.
    Technical Indicators:
        RSI --> Relative Strength Index
        WMA --> Weighted Moving Average
        SMA --> Simple Moving Average
        MOM --> Momentum
        ROC --> Rate of Change
    
    Params:
        ticker --> ticker for technical indicators
        start --> start time to request from
        end --> end time to request too
        resolution --> precision of returned data
            Note: default is 30 (30 min spaced data)
    Returns:
        0 --> exception
        1 --> success
    '''
    def TechnicalIndicators(self, ticker, start, end, resolution='30'):
        res = self.rsi(ticker=ticker, start=start, end=end, resolution=resolution)
        if res == 1:
            return res

        res = self.wma(ticker=ticker, start=start, end=end, resolution=resolution)
        if res == 1:
            return res
        
        res = self.sma(ticker=ticker, start=start, end=end, resolution=resolution)
        if res == 1:
            return res

        
        res = self.momentum(ticker=ticker, start=start, end=end, resolution=resolution)
        if res == 1:
            return res

        res = self.rate_of_change(ticker=ticker, start=start, end=end, resolution=resolution)
        if res == 1:
            return res

        return res
        
    '''
    Requests and writes Relative Strength Index

    Params:
        ticker --> ticker for rsi
        start --> start time for request
        end --> end time for request
        resolution --> spacing between data
    Returns:
        1 --> exception
        0 --> success
    '''
    def rsi(self, ticker, start, end, resolution='15'):
        
        try:
            res = self.client.technical_indicator(symbol=ticker, resolution=resolution, _from=start, to=end, indicator='rsi')
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try: 
                    if df.iloc[i].at['rsi'] != 0:
                        self.db_client.write_data(["RSI,stock={ticker} rsi={rsi} {time}".format(
                                    ticker=ticker,
                                    rsi=df.iloc[i].at['rsi'],
                                    time=df.iloc[i].at['t']
                                )])
                except:
                    print('error writing rsi for influxdb ' + ticker)
                    return 1
        except:
            print('error writing rsi to ' + ticker)
            return 1
        return 0

    '''
    Requests and writes Simple Moving Average

    Params:
        ticker --> ticker for sma
        start --> start time for request
        end --> end time for request
        resolution --> spacing between data
    Returns:
        1 --> exception
        0 --> success
    '''
    def sma(self, ticker, start, end, resolution='15'):
        
        try:
            res = self.client.technical_indicator(symbol=ticker, resolution=resolution, _from=start, to=end, indicator='sma')
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try:
                    if df.iloc[i].at['sma'] != 0:
                        self.db_client.write_data(["SMA,stock={ticker} sma={sma} {time}".format(
                                    ticker=ticker,
                                    sma=df.iloc[i].at['sma'],
                                    time=df.iloc[i].at['t']
                                )])
                except:
                    print('error writing influxdb sma for ' + ticker)
                    return 1
        except:
            print('error writing sma for ' + ticker)
            return 1
        return 0

    '''
    Requests and writes Weighted Moving Average

    Params:
        ticker --> ticker for wma
        start --> start time for request
        end --> end time for request
        resolution --> spacing between data
    Returns:
        1 --> exception
        0 --> success
    '''
    def wma(self, ticker,  start, end, resolution='15'):
        
        try:
            res = self.client.technical_indicator(symbol=ticker, resolution=resolution, _from=start, to=end, indicator='wma')
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try:
                    if df.iloc[i].at['wma'] != 0:
                        self.db_client.write_data(["WMA,stock={ticker} wma={wma} {time}".format(
                                    ticker=ticker,
                                    wma=df.iloc[i].at['wma'],
                                    time=df.iloc[i].at['t']
                                )])
                except:
                    print('error writing wma influxdb for ' + ticker)
                    return 1
        except:
            print('error writing wma for ' + ticker)
            return 1

        return 0

    '''
    Requests and writes momentum

    Params:
        ticker --> ticker for momentum
        start --> start time for request
        end --> end time for request
        resolution --> spacing between data
    Returns:
        1 --> exception
        0 --> success
    '''
    def momentum(self, ticker,  start, end, resolution='15'):
        try: 
            res = self.client.technical_indicator(symbol=ticker, resolution=resolution, _from=start, to=end, indicator='mom')
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try:
                    if df.iloc[i].at['mom'] != 0:
                        self.db_client.write_data(["Momentum,stock={ticker} momentum={momentum} {time}".format(
                                    ticker=ticker,
                                    momentum=df.iloc[i].at['mom'],
                                    time=df.iloc[i].at['t']
                                )])
                except:
                    print('error writing momentum influxdb for ' + ticker)
                    return 1
        except:
            print('error writing momentum for ' + ticker)
            return 1
        return 0

    '''
    Requests and writes rate of change

    Params:
        ticker --> ticker for roc
        start --> start time for request
        end --> end time for request
        resolution --> spacing between data
    Returns:
        1 --> exception
        0 --> success
    '''
    def rate_of_change(self, ticker,  start, end, resolution='15'):
        try:
            res = self.client.technical_indicator(symbol=ticker, resolution=resolution, _from=start, to=end, indicator='roc')
            j = json.dumps(res, indent=4)
            df = pd.read_json(j)
            for i,rows in df.iterrows():
                try:
                    if df.iloc[i].at['roc'] != 0:
                        self.db_client.write_data(["ROC,stock={ticker} roc={roc} {time}".format(
                                    ticker=ticker,
                                    roc=df.iloc[i].at['roc'],
                                    time=df.iloc[i].at['t']
                                )])
                except:
                    print('error writing rate of change influxdb for ' + ticker)
                    return 1
        except:
            print('error writing roc for ' + ticker)
            return 1
        return 0

