import websocket
import json
from datetime import datetime
import pandas as pd
from .Timer_Thread import Timer_Thread

'''
Class to control real time stock prices via the finnhub websocket.
50 supported stocks spawn 50 threads to support real time stock data.
The thread unsubsribes and resubsribes the stock to the websocket to 
prevent high volume stock from overpowering.
'''
class Finnhub_websocket():
    def __init__(self, token, db_client, query_helper, supported_stocks, isMarketClosed):
        self.token = token
        self.db_client = db_client
        self.query_helper = query_helper
        self.supported_stocks = supported_stocks
        self.subscribed_list = []
        self.run = True
        self.interval = 5
        self.isMarketClosed = isMarketClosed

        # Dict to hold threads, want one for each supported stock (50) 
        self.threads = {}

        # websocket.enableTrace(True)
        self.web_socket = websocket.WebSocketApp("wss://ws.finnhub.io?token={token}".format(token=self.token),
                              on_message = self.on_message,
                              on_error = self.on_error,
                              on_close = self.on_close)
        self.web_socket.on_open = self.on_open

    ''' this function will start the websocket '''
    def start_socket(self):
        self.run = True
        self.web_socket.run_forever(skip_utf8_validation=True)

    ''' callback for error '''
    def on_error(self,ws, error):
        print('error is ' + str(error))
    
    ''' perform this on close of websocket '''
    def on_close(self,ws):
        print("### closed ###")

    ''' perform on opening of socket, subsribe to supported stock, initialize timer threads '''
    def on_open(self,ws):

        # create a thread to detect valid times for trading
        self.detectCloseThread = Timer_Thread(
            self.interval,
            self.checkMarketStatus,
            ws
        )

        for stock in self.supported_stocks:
            print('Subscribing to ' + stock)
            ws.send('{"type":"subscribe","symbol":"' + stock + '"}')
            self.timer_thread(ws, stock)

    ''' Simply close the socket and all related threads when the market closes'''
    def checkMarketStatus(self,ws):
        if self.isMarketClosed():
            self.run = False
            ws.close()
            self.detectCloseThread.stop()

        
    ''' add the timer thread to the threads dict, pass function to execute '''
    def timer_thread(self, ws, ticker):
        self.threads[ticker] = Timer_Thread(
            self.interval,
            self.handle_timer,
            ws,
            ticker
        )

    ''' function that gets executed by the timer every X seconds.
        ideally, want to subscribe and unsubscribe stocks from socket.
        This will more evenly space stock readings, so stocks like 
        TSLA and AMZN dont overpower lower volume stocks            '''

    def handle_timer(self, ws, ticker):
        if self.run:
            if ticker in self.subscribed_list:
                ws.send('{"type":"unsubscribe","symbol":"' + ticker + '"}')
                if ticker in self.subscribed_list:
                    try:
                        self.subscribed_list.remove(ticker)
                    except: 
                        print('unable to remove item ' + ticker)
            else:
                ws.send('{"type":"subscribe","symbol":"' + ticker + '"}')
                if ticker not in self.subscribed_list:
                    try:
                        self.subscribed_list.append(ticker)
                    except:
                        print('unable to add item ' + ticker)

        if not self.run:
            self.threads[ticker].stop()

    ''' This function gets called when we get a response from the websocket. For now,
        lets parse the response and send it to our influx database, timer will handle 
        subscribing and unsubscribing to stocks                                      '''

    def on_message(self, ws, message):
        # ping means market is closed
        if 'ping' in message:
            print('No data for now')
        else:
            try:
                data_json = json.dumps(json.loads(message)['data'], sort_keys=True, indent=4, separators=(',', ': '))
                df = pd.read_json(data_json)
                for i,rows in df.iterrows():
                    ########## lets only write one data point for each ticker for the time being ###########
                    if df.iloc[i].at["s"] not in self.subscribed_list:
                        self.subscribed_list.append(df.iloc[i].at["s"])
                        self.db_client.write_data(["stock_prices,stock={ticker} price={price} {time}".format(
                                ticker=df.iloc[i].at["s"],
                                cur_date=datetime.fromtimestamp(df.loc[i].at["t"] / 1000.0).strftime('%Y-%m-%d_%H:%M:%S'),
                                price=format(df.loc[i].at["p"], ".3f"),
                                time=int(df.loc[i].at["t"] / 1000.0)
                            )])
            except:
                print("error reading data and sending to influxdb")


                
        

        