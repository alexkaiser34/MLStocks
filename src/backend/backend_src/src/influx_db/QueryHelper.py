from datetime import date, datetime, timezone
from dateutil.relativedelta import relativedelta

class QueryHelper:

    def __init__(self,bucket, db_client):
        self.bucket = bucket
        self.db_client = db_client
        
    def supported_stocks(self):
        start = (datetime.now() - relativedelta(years=1)).strftime('%Y-%m-%d')
        start = int(datetime.strptime(start,'%Y-%m-%d').timestamp())

        end = datetime.now().strftime('%Y-%m-%d')
        end = int(datetime.strptime(end,'%Y-%m-%d').timestamp())
        query = 'from(bucket: "{bucket}") \
                |> range(start: {start_time}, stop: {end_time}) \
                |> keyValues(keyColumns: ["stock"])'.format(
                    bucket=self.bucket,
                    start_time=start,
                    end_time=end
                )
        
        return self.db_client.supported_stock_list(query)

    def get_time_ticks(self, ticker, measurement):
        start = (datetime.now() - relativedelta(years=1)).strftime('%Y-%m-%d')
        start = int(datetime.strptime(start,'%Y-%m-%d').timestamp())

        end = datetime.now().strftime('%Y-%m-%d')
        end = int(datetime.strptime(end,'%Y-%m-%d').timestamp())

        query = 'from(bucket: "{bucket}") \
                |> range(start: {start_time}, stop: {end_time}) \
                |> filter(fn: (r) => r["stock"] == "{stock}") \
                |> filter(fn: (r) => r["_measurement"] == "{measurement}")'.format(
                    bucket=self.bucket,
                    start_time=start,
                    end_time=end,
                    stock=ticker,
                    measurement=measurement,
                )

        return self.db_client.stock_time_measurements(query)

    def drop_more(self, ticker):
        start = (datetime.now() - relativedelta(days=1)).strftime('%Y-%m-%d')
        start = int(datetime.strptime(start,'%Y-%m-%d').timestamp())

        end = datetime.now().strftime('%Y-%m-%d')
        end = int(datetime.strptime(end,'%Y-%m-%d').timestamp())

        query = 'from(bucket: "{bucket}") \
                |> range(start: {start_time}, stop: {end_time}) \
                |> filter(fn: (r) => r["stock"] == "{stock}") \
                |> drop(fn: (column) => column == "_measurement") \
                |> yield()'.format(
                    bucket=self.bucket,
                    start_time=start,
                    end_time=end,
                    stock=ticker
                )

        return self.db_client.drop_more(query)

    def drop_measurement(self, measurement):
        start = (datetime.now(timezone.utc) - relativedelta(days=1)).astimezone()
        start = start.isoformat("T")
        start = start[:start.find(".")] + "Z"
        end = datetime.now(timezone.utc).astimezone()
        end = end.isoformat("T")
        end = end[:end.find(".")] + "Z"
        self.db_client.drop_measurement(start, end, measurement)



