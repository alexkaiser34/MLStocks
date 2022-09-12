import React from "react";

import { 
    CompanyProfileData,
    CompanyStockPrice,
    CompanyEarningsData,
    CompanyNewsData,
    CompanyBuyHoldData,
    CompanyMeasurements
} from "./QueryHelperTypes";

export interface setTime {
    name: string,
    time: TimeOps,
}

export interface setPrice {
    name: string,
    price: CompanyStockPrice,
}

export interface setExpand {
    name: string,
    expanded: boolean
}
export interface setFinancials {
    name: string,
    financials: CompanyFinancials
}

export interface setProfile {
    ticker:string,
    companyProfile: CompanyProfileData
}

export interface setNews {
    name: string,
    companyNews: CompanyNewsData
}

export interface setEarnings {
    name: string,
    earnings: CompanyEarningsData[]
}

export interface setMeasurement {
    name: string,
    measurements: CompanyMeasurements
}

export interface setBuyHold {
    name: string,
    buyHold: CompanyBuyHoldData
}

export interface setNewsExpanded {
    name: string,
    expanded: boolean,
}

export type MeasurementOps = 'Price' | 'sma' | 'wma' | 'roc' | 'rsi' | 'momentum' | 'ML';

export type MLTimeOps = '1d' | '10d' | '30d' | '60d' | '180d'; 
export type TimeOps = '-1h' | '-1d' | '-2d' | '-3d' | '-7d' | '-31d' | '-364d' | MLTimeOps;
export interface setCurrentValue {
    name:string,
    measurement: MeasurementOps,
    value: string,
    percentChange: string,
}

export interface setMoverChange {
    name:string,
    value: string,
}

