from http import client
import os
from time import time
from influxdb_client import InfluxDBClient, Point, WritePrecision, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS, ASYNCHRONOUS

'''This class will handle the writing and querying for the influx database.
    The frontend will also have a client who will be continuously querying 
    from this database                                                      '''
class InfluxClient:
    def __init__(self,token,org,bucket): 
        self._org = org 
        self._bucket = bucket
        self._client = InfluxDBClient(url="127.0.0.1:8086/", token=token, org=org, timeout=80000)
        self.delete_api = self._client.delete_api()

    def write_data(self,data,write_option=SYNCHRONOUS):
        write_api = self._client.write_api(write_options=write_option)
        write_api.write(self._bucket, self._org , data, write_precision='s')
    
    def supported_stock_list(self,query):
        query_api = self._client.query_api()
        result = query_api.query(org=self._org, query=query)
        results = []
        for table in result:
            for record in table.records:
                if (record.values.get("stock")) not in results:
                    results.append((record.values.get("stock")))
        return results 

    def stock_time_measurements(self,query):
        query_api = self._client.query_api()
        result = query_api.query(org=self._org, query=query)
        results = []

        for table in result:
            for record in table.records:
                # if (record.get_mesaurement()) not in results:
                results.append((int(record.get_time().timestamp()), record.get_value()))
                # results['value'].append(record.get_time())
                # print(record.get_time(), record.get_value())

        return results 

    def drop_more(self,query):
        query_api = self._client.query_api()
        result = query_api.query(org=self._org, query=query)
        # results = []
        # for table in result:
        #     for record in table.records:
        #         # if (record.get_mesaurement()) not in results:
        #         results.append((record.get_measurement()))
        # print(results)
        # return results 
        

    def drop_measurement(self,start, stop, measurement):
        self.delete_api.delete(start,stop,predicate='stock="AAPL"'.format(measurement=measurement), bucket=self._bucket, org=self._org)
        print("Deleted " + measurement)