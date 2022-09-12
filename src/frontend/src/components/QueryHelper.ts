import React from "react";
import { InfluxDB, QueryApi } from "@influxdata/influxdb-client";
import {
    CompanyBuyHoldData,
    CompanyEarningsData,
    CompanyEarningsPts,
    CompanyFinancials,
    CompanyNewsData, 
    CompanyNewsPts, 
    CompanyProfileData, 
    CompanyStockData, 
    CurrentValData,
    QueryHelperProps
} from '../types/QueryHelperTypes';
import { MeasurementOps, TimeOps } from "../types/ChartUI_Actions";
import { MarketNewsData, MarketNewsPts } from "../types/MarketNews";

interface axis_points {
    x: string,
    y: string
}

export const Query_API = (token: any, org: any, bucket: any) => {
    const url = 'https://mlstocks-kaiserale.pitunnel.com';
    return new InfluxDB({ url, token }).getQueryApi(org);
}

function resampledTime(s: TimeOps | string):string{

    let filterTime:string = '1d';

    switch (s){
        case '-1d':
            filterTime = '10m';
            break;
        case '-31d':
            filterTime = '1d';
            break;
        case '-1h':
            filterTime = '1s';
            break;
        case '-364d':
            filterTime = '1d';
            break;
        default:
            break;
    }
    return filterTime;
}

export const Query_Helper_stockPrice = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["_measurement"] == "stock_prices") \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';


    return query;
}

export const Query_Helper_companyProfile = (p: QueryHelperProps):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "companyProfile")';

    return query;
}

export const Query_Helper_companyNews = (p: QueryHelperProps):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "companyNews") \
                    |> sort(columns: ["_time"], desc: true)';

    return query;
}

export const Query_Helper_buyHold = (p: QueryHelperProps):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "buyHold")';
    return query;
}

export const Query_Helper_Earnings = (p: QueryHelperProps):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "earningsCalendar")';
    return query;
}

export const Query_Helper_Financials = (p: QueryHelperProps):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "basicFinancials") \
                    |> last()';
    return query;
}

export const Query_Helper_RSI = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "RSI") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}

export const Query_Helper_SMA = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "SMA") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}

export const Query_Helper_WMA = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);


    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "WMA") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}

export const Query_Helper_ROC = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "ROC") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}
export const Query_Helper_Momentum = (p: QueryHelperProps):string => {

    const filterTime = resampledTime(p.time);
    
    
    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + p.time + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "Momentum") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}

/** for this function, we only want to query future data points */
export const Query_Helper_ML = (p: QueryHelperProps):string => {

    const filterTime = '1d';
    let futureDate:number = 0;
    switch(p.time){
        case '10d':
            futureDate = Math.floor((new Date(Date.now() + 8.64e8).getTime()) / 1000);
            break;
            
        case '30d':
            futureDate = Math.floor((new Date(Date.now() + 2.592e9).getTime()) / 1000);
            break;
        
        case '60d':
            futureDate = Math.floor((new Date(Date.now() + 5.184e9).getTime()) / 1000);
            break;
        
        case '180d':
            futureDate = Math.floor((new Date(Date.now() + 1.555e10).getTime()) / 1000);
            break;

        default:
            futureDate = Math.floor((new Date(Date.now() + 2.592e9).getTime()) / 1000);
            break;
    }
    const currentDate = Math.floor((new Date(Date.now()).getTime())/ 1000);

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + currentDate + ', stop: ' + futureDate + ') \
                    |> filter(fn: (r) => r["stock"] == "' + p.ticker + '") \
                    |> filter(fn: (r) => r["_measurement"] == "MachineLearning") \
                    |> aggregateWindow(every: ' + filterTime + ', fn: last) \
                    |> truncateTimeColumn(unit: 1s)';
    return query;
}

export const Query_Helper_marketNews = (s: string):string => {

    const query = 'from(bucket: "stock_data") \
                    |> range(start: ' + s + ') \
                    |> filter(fn: (r) => r["generalNews"] == "MarketNews") \
                    |> filter(fn: (r) => r["_measurement"] == "marketNews") \
                    |> sort(columns: ["_time"], desc: true)';

    return query;
}

export const Query_CompanyFinancials = async (
    ticker:string,
    time: TimeOps,
    queryApi: QueryApi
): Promise<CompanyFinancials> => {

    return new Promise<CompanyFinancials>((resolve, reject) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;
        let finalData:any = {
            'Close': 0,
            'High': 0,
            'Low': 0,
            'Open': 0,
            'Volume': 0,
            'PEratio': 0,
            'beta': 0,
            'AverageVolume': 0,
            '52WeekHigh': 0,
            '52WeekHighDate': '',
            '52WeekLow': 0,
            '52WeekLowDate': '',
            '52WeekDailyPriceReturn': 0,
            'DividendYield': 0,
        }

        queryApi.queryRows(Query_Helper_Financials(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                // /**only set data when there is data to be had */
                if (res.length > 0){
                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({_field, _value}: any) => {
                        finalData[_field] = _value;
                    })
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    reject(finalData);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject(finalData);
            }
            });
    });
}



export const Query_CompanyProfile = async (
    ticker:string,
    time: TimeOps,
    queryApi: QueryApi
): Promise<CompanyProfileData> => {

    return new Promise<CompanyProfileData>((resolve, reject) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;
            let finalData:CompanyProfileData = {
                exchange: '',
                ipo: '',
                logo: '',
                name: '',
                description: '',
                weburl: '',
            }

        queryApi.queryRows(Query_Helper_companyProfile(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                // /**only set data when there is data to be had */
                if (res.length > 0){
                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({_field, _value}: any) => {
                        if (_field == 'exchange'){
                            finalData.exchange = _value;
                        }
                        else if (_field == 'ipo'){
                            finalData.ipo = _value;
                        }
                        else if (_field == 'logo'){
                            finalData.logo = _value;
                        }
                        else if (_field == 'name'){
                            finalData.name = _value;
                        }
                        else if (_field == 'description'){
                            if(_value == ''){
                                finalData.description = 'No description available';
                            }
                            else {
                                finalData.description = _value;
                            }
                        }
                        else if (_field == 'weburl'){
                            finalData.weburl = _value;
                        }
                    })
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    reject(finalData);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject(finalData);
            }
            });
    });
}

export const Query_CompanyNews = async (
    ticker:string,
    time: TimeOps,
    queryApi: QueryApi
): Promise<CompanyNewsData[]> => {

    return new Promise<CompanyNewsData[]>((resolve,reject) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;

        let finalData:CompanyNewsData[] = [];
        queryApi.queryRows(Query_Helper_companyNews(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                let indexHeadline = 0;
                let indexSummary = 0;
                let indexSource = 0;
                let indexImage = 0;
                let indexUrl = 0;

                let data_pts:CompanyNewsPts = {
                    headline: [],
                    summary: [],
                    source: [],
                    image: [],
                    url: [],
                    time: []
                }
                // /**only set data when there is data to be had */
                if (res.length > 0){
                    // console.log(res)

                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({_field, _value, _time}: any) => {
                        if (_field == 'headline'){
                            data_pts.headline[indexHeadline] = _value;
                            data_pts.time[indexHeadline] = _time;
                            indexHeadline += 1;
                        }
                        else if (_field == 'summary'){
                            data_pts.summary[indexSummary] = _value;
                            indexSummary += 1;
                        }
                        else if (_field == 'source'){
                            data_pts.source[indexSource] = _value;
                            indexSource += 1;
                        }
                        else if (_field == 'newsImage'){
                            data_pts.image[indexImage] = _value;
                            indexImage += 1;
                        }
                        else if (_field == 'newsUrl'){
                            data_pts.url[indexUrl] = _value;
                            indexUrl += 1;
                        }
                    });


                    for (let i = 0; i < data_pts.headline.length; i++){
                        finalData[i] = {
                            headline: data_pts.headline[i],
                            summary: data_pts.summary[i],
                            source: data_pts.source[i],
                            image: data_pts.image[i],
                            url: data_pts.url[i],
                            time: data_pts.time[i]
                        };
                    }
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    reject([]);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject([]);
            }
            });
    });
}

export const Query_MarketNews = async (
    time: TimeOps,
    queryApi: QueryApi
): Promise<MarketNewsData[]> => {

    return new Promise<MarketNewsData[]>((resolve,reject) => {

        let res = [] as any;

        let finalData:MarketNewsData[] = [];
        queryApi.queryRows(Query_Helper_marketNews(time), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                let indexHeadline = 0;
                let indexSummary = 0;
                let indexSource = 0;
                let indexImage = 0;
                let indexUrl = 0;
                let indexCategory = 0;


                let data_pts:MarketNewsPts = {
                    headline: [],
                    summary: [],
                    source: [],
                    image: [],
                    url: [],
                    category: [],
                    time: []
                }
                // /**only set data when there is data to be had */
                if (res.length > 0){
                    // console.log(res)

                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({_field, _value, _time}: any) => {
                        if (_field == 'Headline'){
                            data_pts.headline[indexHeadline] = _value;
                            data_pts.time[indexHeadline] = _time;
                            indexHeadline += 1;
                        }
                        else if (_field == 'Summary'){
                            data_pts.summary[indexSummary] = _value;
                            indexSummary += 1;
                        }
                        else if (_field == 'Source'){
                            data_pts.source[indexSource] = _value;
                            indexSource += 1;
                        }
                        else if (_field == 'Image'){
                            data_pts.image[indexImage] = _value;
                            indexImage += 1;
                        }
                        else if (_field == 'Url'){
                            data_pts.url[indexUrl] = _value;
                            indexUrl += 1;
                        }
                        else if (_field == 'Category'){
                            data_pts.category[indexCategory] = _value;
                            indexCategory += 1;
                        }
                    });


                    for (let i = 0; i < data_pts.headline.length; i++){
                        finalData[i] = {
                            headline: data_pts.headline[i],
                            summary: data_pts.summary[i],
                            source: data_pts.source[i],
                            image: data_pts.image[i],
                            url: data_pts.url[i],
                            category: data_pts.category[i],
                            time: data_pts.time[i]
                        };
                    }
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    reject([]);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject([]);
            }
            });
    });
}

export const Query_BuyHold = async (
    ticker:string,
    time: TimeOps,
    queryApi: QueryApi
): Promise<CompanyBuyHoldData> => {

    return new Promise<CompanyBuyHoldData>((resolve,reject) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;
            let data_init:axis_points[] = [{x: '', y: ''}]
            let finalData:CompanyBuyHoldData = {
                buy: 0,
                sell: 0,
                hold: 0,
                strongbuy: 0,
                strongsell: 0,
            }

        queryApi.queryRows(Query_Helper_buyHold(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                // let index = 0;
                // /**only set data when there is data to be had */
                if (res.length > 0){
                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({_field, _value}: any) => {
                        if (_field == 'buy'){
                            finalData.buy = _value;
                        }
                        else if (_field == 'sell'){
                            finalData.sell = _value;
                        }
                        else if (_field == 'hold'){
                            finalData.hold = _value;
                        }
                        else if (_field == 'strongbuy'){
                            finalData.strongbuy = _value;
                        }
                        else if (_field == 'strongsell'){
                            finalData.strongsell = _value;
                        }
                    })
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    reject(finalData);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject(finalData);
            }
            });
    });
}

export const Query_Earnings = async (
    ticker:string,
    time: TimeOps,
    queryApi: QueryApi
): Promise<CompanyEarningsData[]> => {

    return new Promise<CompanyEarningsData[]>((resolve) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;
        let finalData: CompanyEarningsData[] = [];


        queryApi.queryRows(Query_Helper_Earnings(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                let data_pts:CompanyEarningsPts = {
                    Actual: [],
                    Estimate: [],
                    Surprise: [],
                    Surprise_perentage: [],
                    time: []
                }

                let counters:any = {
                    index_act: 0,
                    index_est: 0,
                    index_sur: 0,
                    index_sur_per: 0
                }

                /** for now, easiest approach.  This is tricky because 
                 * the data returned is as followed.
                 * 
                 * 3 time points example
                 * 
                 * Actual
                 * Actual
                 * Actual
                 * Estimate
                 * Estimate
                 * Estimate
                 * Surprise
                 * Surprise
                 * Surprise
                 * Perc
                 * Perc
                 * Perc
                 * 
                 * want each point returned, so create data point arrays 
                 * when parsing the response.  Then, create a object of points
                 * to return in a for loop using those data arrays.
                 * 
                 */
                if (res.length > 0){

                    res.map(({_field, _time, _value}: any) => {
                        
                        if (_field == 'Actual'){
                            data_pts.Actual[counters.index_act] = _value;
                            data_pts.time[counters.index_act] = _time;
                            counters.index_act += 1;
                        }
                        else if (_field == 'Estimate'){
                            data_pts.Estimate[counters.index_est] = _value;
                            counters.index_est += 1;
                        }
                        else if (_field == 'Surprise'){
                            data_pts.Surprise[counters.index_sur] = _value;
                            counters.index_sur += 1;
                        }
                        else if (_field == 'Surprise_percentage'){
                            data_pts.Surprise_perentage[counters.index_sur_per] = _value;
                            counters.index_sur_per += 1;
                        }
                    })

                    for (let i = 0; i < data_pts.Actual.length; i++){
                        finalData[i] = {
                            Actual: data_pts.Actual[i],
                            Estimate: data_pts.Estimate[i],
                            Surprise: data_pts.Surprise[i],
                            Surprise_percentage: data_pts.Surprise_perentage[i],
                            time: data_pts.time[i]
                        };
                    };
                    /** return the promise */
                    resolve(finalData);
                }
                else {
                    resolve([]);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                resolve([]);
            }
            });
    });
}

/** the length of finaldata depends if we are machine learning
 * one object will hold past prices, one will hold future predictions
 * similar approach in the measurement query, as we compare the last
 * stock price known to the last future price predicted
 */
export const Query_GraphData = async (
    ticker: string, 
    time: TimeOps,
    measurement: string,
    queryApi: QueryApi
    ): Promise<CompanyStockData[]> => {

    return new Promise<CompanyStockData[]>((resolve,reject) => {
        const p:QueryHelperProps = { ticker: ticker, time: time};

        let res = [] as any;

        // we want to return 2 ids for ML
        // first will contain original stock data
        //  second will contain future stock predictions
        let finalData:CompanyStockData[] =  measurement == 'ML' ? 
        [
            {
                id: '',
                data: []
            },
            {
                id: '',
                data: []
            }
        ]
        :
        [{
            id: '',
            data: []
        }];

        const Query_measurement = measurement == 'rsi' ? Query_Helper_RSI :
                    measurement == 'sma' ? Query_Helper_SMA :
                    measurement == 'wma' ? Query_Helper_WMA :
                    measurement == 'roc' ? Query_Helper_ROC :
                    measurement == 'momentum' ? Query_Helper_Momentum  : 
                    measurement == 'ML' ?  Query_Helper_ML : Query_Helper_stockPrice;

        queryApi.queryRows(Query_measurement(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                // console.log(res);
                let index = 0;
                /**only set data when there is data to be had */
                if (res.length > 0){
                    /** Map the response into a format that can be passed to the responsive graph */
                    res.map(({stock, _time, _value}: any) => {

                        // for ML, want to append the array in element 1
                        if (measurement == 'ML'){
                            finalData[1].id = 'future';
                            finalData[1].data.push({x: _time, y: _value.toFixed(2)});
                            index += 1;
                        }

                        // for regular, just return the data
                        else {
                            finalData[0].id = stock;
                            finalData[0].data.push({x: _time, y: _value.toFixed(2)});
                            index += 1;
                        }
                    })
                    index = 0;
                    res = [] as any;
                    // we need to perform another query for stock price for ML measurement if we had a successful query
                    // the original stock price will be compared to future
                    if (measurement == 'ML'){
                        let t:string = '';
                        switch(time){
                            case '10d':
                                t = '-10d';
                                break;
                            case '30d':
                                t = '-30d';
                                break;
                            case '60d':
                                t = '-60d';
                                break;
                            case '180d':
                                t = '-180d';
                                break;
                            default: 
                                t = '-30d';
                        }

                        queryApi.queryRows(Query_Helper_stockPrice({ticker: ticker, time: t}), {
                            next(row, tableMeta) {
                                const o = tableMeta.toObject(row);
                                res.push(o);
                                
                            },
                            complete() {
                                // map in regular price data in 0 position
                                if (res.length > 0){
                                    res.map(({stock, _time, _value}: any) => {
                                        finalData[0].id = stock;
                                        finalData[0].data.push({x: _time, y: _value.toFixed(2)});
                                        index += 1;
                                    });
                                    // insert the last element of the price to the first position of the future predictions
                                    finalData[1].data.unshift(finalData[0].data.at(index - 1));

                                    // resolve the promise
                                    // finalData[0] = regular price
                                    // finalData[1] = future price
                                    resolve(finalData);
                                }
                                else {
                                    resolve([]);
                                }
                            },
                            error(error) {
                                console.log("query failed- ", error);
                                reject([]);
                            }
                        })
                    }

                    /** return the promise if we are not using ML */
                    if (measurement != 'ML'){
                        resolve(finalData);
                    }
                }
                else {
                    resolve([]);
                }
            },
            error(error) {
                console.log("query failed- ", error);
                reject([]);
            }
            });
    });

}

export const Query_Measurement = async (
    ticker: string,
    time: TimeOps,
    measurement: MeasurementOps,
    queryApi: QueryApi
    ): Promise<CurrentValData> => {
    
    return new Promise<CurrentValData>((resolve) => {
        const p:QueryHelperProps = { ticker: ticker, time: time  };
        let res = [] as any;

        let finalData:CompanyStockData[] =  measurement == 'ML' ? 
        [{
            id: '',
            data: [],
        },
        {
            id: '',
            data: [],
        }]
        :
        [{
            id: '',
            data: [],
        }];

        const Query_helper_fn = measurement == 'rsi' ? Query_Helper_RSI :
                    measurement == 'sma' ? Query_Helper_SMA :
                    measurement == 'wma' ? Query_Helper_WMA :
                    measurement == 'roc' ? Query_Helper_ROC :
                    measurement == 'momentum' ? Query_Helper_Momentum :
                    measurement == 'ML' ? Query_Helper_ML : Query_Helper_stockPrice;

        queryApi.queryRows(Query_helper_fn(p), {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                res.push(o);
            },
            complete() {
                let index = 0;
                let indexFuture = 0;
                if (res.length > 0){
                    res.map(({stock, _time, _value}: any) => {
                        if (measurement == 'ML'){
                            finalData[1].id = 'future';
                            finalData[1].data[indexFuture]  = {x: _time, y: _value};
                            indexFuture += 1;
                        }
                        else {
                            finalData[0].id = stock;
                            finalData[0].data[index] = {x: _time, y: _value};
                            index += 1;
                        }
                    });

                    if (measurement == 'ML'){
                        index = 0;
                        res = [] as any;
                        let t:string = '';
                        switch(time){
                            case '10d':
                                t = '-10d';
                                break;
                            case '30d':
                                t = '-30d';
                                break;
                            case '60d':
                                t = '-60d';
                                break;
                            case '180d':
                                t = '-180d';
                                break;
                            default: 
                                t = '-30d';
                        }

                        queryApi.queryRows(Query_Helper_stockPrice({ticker: ticker, time: t}), {
                            next(row, tableMeta) {
                                const o = tableMeta.toObject(row);
                                res.push(o);
                                
                            },
                            complete() {
                                // map in regular price data in 0 position
                                if (res.length > 0){
                                    res.map(({stock, _time, _value}: any) => {
                                        finalData[0].id = stock;
                                        finalData[0].data.push({x: _time, y: _value.toFixed(2)});
                                        index += 1;
                                    });
                                    // insert the last element of the price to the first position of the future predictions
                                    finalData[1].data.unshift(finalData[0].data[res.length - 1]);
                                    const initial_price: number = Number(finalData[1].data[0].y);
                                    const final_price: number =  Number(finalData[1].data[indexFuture].y);
                                    const percentChange: string = (((final_price - initial_price) / initial_price)* 100.0).toFixed(2);

                                    console.log('Initial percent change price ML is ' + initial_price);
                                    console.log('Final percent change price ML is ' + final_price);

                                    resolve({
                                        value: final_price.toFixed(2),
                                        percentChange: percentChange,
                                    });
                                }
                                else {
                                    resolve({
                                        value: 'No data',
                                        percentChange: ''
                                    })
                                }
                            },
                            error(error) {
                                console.log("query failed- ", error);
                                resolve({
                                    value: 'No data',
                                    percentChange: ''
                                })
                            }
                        })
                    }
                    else {
                        const initial_price: number = Number(finalData[0].data[0].y);
                        const final_price: number =  Number(finalData[0].data[res.length - 1].y);
                        const percentChange: string = (((final_price - initial_price) / initial_price)* 100.0).toFixed(2);
                        const difference: string = (final_price - initial_price).toFixed(2); 


                        resolve({
                            value: final_price.toFixed(2),
                            percentChange: (measurement == 'momentum' || measurement == 'roc' || measurement == 'rsi') ? difference : percentChange,
                        });
                    }
                }
                else {
                    resolve({
                        value: 'No data',
                        percentChange: ''
                    })
                }
            },
            error(error) {
                console.log("query failed- ", error);
                resolve({
                    value: 'No data',
                    percentChange: ''
                })
            }
            });
    })
}