import React from "react";
import { TimeOps } from "./ChartUI_Actions";

export interface CompanyProfileData {
    exchange: string,
    ipo:string,
    logo:string,
    name: string,
    description: string,
    weburl:string,
}

export interface CompanyFinancials {
    'Close': number,
    'High': number,
    'Low': number,
    'Open': number,
    'Volume': number,
    'PEratio': number,
    'beta': number,
    'AverageVolume': number,
    '52WeekHigh': number,
    '52WeekHighDate': string,
    '52WeekLow': number,
    '52WeekLowDate': string,
    '52WeekDailyPriceReturn': number,
    'DividendYield': number,
    // 'time': string,
}
export interface CompanyMeasurements {
    'sma': boolean,
    'wma': boolean,
    'rsi': boolean,
    'momentum': boolean,
    'roc': boolean,
    'Price': boolean,
    'ML': boolean,
}


export interface CompanyNewsData {
    headline: string,
    summary: string,
    source: string,
    image: string,
    url: string,
    time: string,
}

export interface CompanyNewsPts {
    headline: string[],
    summary: string[],
    source: string[],
    image: string[],
    url: string[],
    time: string[]   
}

export interface CompanyBuyHoldData {
    sell: number,
    buy: number,
    hold: number,
    strongsell: number,
    strongbuy: number,
}

export interface CompanyEarningsData {
    Actual: string,
    Estimate: string,
    Surprise: string,
    Surprise_percentage: string,
    time: string,
}

export interface CompanyEarningsPts {
    Actual: string[],
    Estimate: string[],
    Surprise: string[],
    Surprise_perentage: string[],
    time: string[]
}

export interface CurrentValData {
    value: string,
    percentChange: string,
}

export interface CompanyStockData {
    id: string,
    data: axis_points[]
}

export type QueryHelperProps = {
    time: TimeOps | string,
    ticker: string
}

export interface CompanyCurrentVals {
    'Price': CurrentValData,
    'sma': CurrentValData,
    'wma': CurrentValData,
    'rsi': CurrentValData,
    'momentum': CurrentValData,
    'roc': CurrentValData,
    'ML': CurrentValData
}