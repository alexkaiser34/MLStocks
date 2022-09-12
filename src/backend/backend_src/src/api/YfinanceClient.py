import yfinance as yf
from datetime import datetime

'''
Basic class to use yfinance module.

For now, we only need description of a ticker
'''
class YfinanceClient:

    def __init__(self):
        pass

    def get_description(self, ticker):
        try:
            data = yf.Ticker(ticker).info['longBusinessSummary']
            if data is not None:
                return data
            else:
                return ''
        except:
            print('unable to fetch data from yfinance for ' + ticker)

        return ''
    
    def get_financials(self, ticker):
        data = yf.Ticker(ticker).financials
        print(data)        
        # if data is not None:
        #     try:
        #         db_client.write_data(["companyDescription,stock={ticker} description=\"{decription}\" {time}".format(
        #                 ticker=ticker,
        #                 description=str(data).replace('"', ''),
        #                 time=int(datetime.now().timestamp())
        #             )])
        #     except:
        #         print('unable to write long summary for ' + ticker)