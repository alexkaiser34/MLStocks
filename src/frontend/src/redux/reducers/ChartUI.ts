import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { 
    CompanyBuyHoldData, 
    CompanyCurrentVals, 
    CompanyEarningsData, 
    CompanyFinancials, 
    CompanyMeasurements, 
    CompanyNewsData, 
    CompanyProfileData, 
    CurrentValData
} from '../../types/QueryHelperTypes';
import {
    setTime,
    setNews,
    setBuyHold,
    setEarnings,
    setProfile,
    setPrice,
    setExpand,
    setNewsExpanded,
    setFinancials,
    setMeasurement,
    setCurrentValue,
    setMoverChange,
    TimeOps
} from '../../types/ChartUI_Actions';

export interface TickerData {
    time: TimeOps,
    expanded: boolean,
    companyProfile: CompanyProfileData,
    news: CompanyNewsData[],
    buyHold: CompanyBuyHoldData,
    earnings: CompanyEarningsData[],
    financials: CompanyFinancials,
    measurements: CompanyMeasurements,
    newsExpanded: boolean,
    currentValues: CompanyCurrentVals,
    yearlyChange: string,
    dailyChange: string,
}

export type TickerType = {
    [name:string]:TickerData,
}

interface Tickers {
    ticker: TickerType,
    isExpanded: boolean
}

/**
 * Somewhat complex, but for now, lets return an object holding
 * data for each ticker the user can interact with via the graph.
 * Currently set up as key value pair, proving ticker symbol
 * will return an object holding data for that specific ticker
 */
const initalState: Tickers = {
    ticker: {['']:
        {
            time:'-364d',
            expanded: false,
            companyProfile: {
                exchange: '',
                ipo: '',
                logo: '',
                name: '',
                description: '',
                weburl:'',
            },
            news: [{
                headline: '',
                summary: '',
                source: '',
                image: '',
                url: '',
                time: ''
            }],
            buyHold: {
                sell: 0,
                strongbuy: 0,
                strongsell: 0,
                hold: 0,
                buy: 0
            },
            earnings: [{
                Estimate: '',
                Actual: '',
                Surprise: '',
                Surprise_percentage: '',
                time: ''
            }],
            financials: {
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
                // 'time': '',
            },
            measurements: {
                'sma': false,
                'wma': false,
                'rsi': false,
                'momentum': false,
                'roc': false,
                'Price': true,
                'ML': false,
            },
            newsExpanded: false,
            currentValues: {
                'Price' : {
                    value: '',
                    percentChange: '',
                },
                'sma' : {
                    value: '',
                    percentChange: '',
                },
                'wma' : {
                    value: '',
                    percentChange: '',
                },
                'roc' : {
                    value: '',
                    percentChange: '',
                },
                'rsi' : {
                    value: '',
                    percentChange: '',
                },
                'momentum' : {
                    value: '',
                    percentChange: '',
                },
                'ML' : {
                    value: '',
                    percentChange: '',
                },
            },
            yearlyChange: '',
            dailyChange: '',
        }
    },
    isExpanded: false
}
    

/* the create slice method actual creates the reducer.
   It also defines the redux actions on the reducer, as 
   well as the changing of any variable values 
*/
export const ChartUI = createSlice({
    name: "ChartUI",
    initialState: initalState,
    reducers: {
        set_time: (state, action: PayloadAction<setTime>) => {
            state.ticker[action.payload.name].time = action.payload.time;
        },
        set_news: (state, action: PayloadAction<setNews>) => {
            let exists = false;
            state.ticker[action.payload.name].news.map((obj) => {
                if (action.payload.companyNews.headline == obj.headline){
                    exists = true;
                }
            });

            if (!exists) {
                state.ticker[action.payload.name].news.push(action.payload.companyNews);
            }
        },
        set_buy_hold: (state, action: PayloadAction<setBuyHold>) => {
            state.ticker[action.payload.name].buyHold = action.payload.buyHold;
        },
        set_earnings: (state, action: PayloadAction<setEarnings>) => {

            action.payload.earnings.map((value: CompanyEarningsData, index: number) => {
                state.ticker[action.payload.name].earnings[index] = value;
            })

        },
        set_profile: (state, action: PayloadAction<setProfile>) => {
            state.ticker[action.payload.ticker].companyProfile = action.payload.companyProfile;
        },
        initial_set: (state, action: PayloadAction<string[]>) => {
            action.payload.map((str) => {
                state.ticker[str] = {
                    time: '-364d',
                    expanded: false,
                    companyProfile: {
                        exchange: '',
                        ipo: '',
                        logo: '',
                        name: '',
                        description: '',
                        weburl: '',
                    },
                    news: [{
                        headline: '',
                        summary: '',
                        source: '',
                        image: '',
                        url: '',
                        time: ''
                    }],
                    buyHold: {
                        sell: 0,
                        strongbuy: 0,
                        strongsell: 0,
                        buy: 0,
                        hold: 0,
                    },
                    earnings: [{
                        Estimate: '',
                        Actual: '',
                        Surprise: '',
                        Surprise_percentage: '',
                        time: ''
                    }],
                    financials: {
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
                        // 'time': '',
                    },
                    measurements: {
                        'sma': false,
                        'wma': false,
                        'rsi': false,
                        'momentum': false,
                        'roc': false,
                        'Price': true,
                        'ML': false
                    },
                    
                    newsExpanded: false,
                    currentValues: {
                        'Price' : {
                            value: '',
                            percentChange: '',
                        },
                        'sma' : {
                            value: '',
                            percentChange: '',
                        },
                        'wma' : {
                            value: '',
                            percentChange: '',
                        },
                        'roc' : {
                            value: '',
                            percentChange: '',
                        },
                        'rsi' : {
                            value: '',
                            percentChange: '',
                        },
                        'momentum' : {
                            value: '',
                            percentChange: '',
                        },
                        'ML' : {
                            value: '',
                            percentChange: '',
                        },
                    },
                    yearlyChange: '',
                    dailyChange: '',
        }});
        },
        set_currentValue: (state, action: PayloadAction<setCurrentValue>) => {
            state.ticker[action.payload.name].currentValues[action.payload.measurement] = {
                percentChange: action.payload.percentChange,
                value: action.payload.value
            }
        },
        set_expanded: (state, action: PayloadAction<setExpand>) => {
            state.ticker[action.payload.name].expanded = action.payload.expanded;
            state.isExpanded = action.payload.expanded;
        },
        set_newsExpanded: (state, action: PayloadAction<setNewsExpanded>) => {
            state.ticker[action.payload.name].newsExpanded = action.payload.expanded;
        },
        set_financials: (state, action: PayloadAction<setFinancials>) => {
            state.ticker[action.payload.name].financials = action.payload.financials;
        },
        set_measurement: (state, action: PayloadAction<setMeasurement>) => {
            state.ticker[action.payload.name].measurements = action.payload.measurements;
        },
        set_yearlyChange: (state, action: PayloadAction<setMoverChange>) => {
            state.ticker[action.payload.name].yearlyChange = action.payload.value;
        },
        set_dailyChange: (state, action: PayloadAction<setMoverChange>) => {
            state.ticker[action.payload.name].dailyChange = action.payload.value;
        },

    }
})

/* export the reducer to be included in the store, as well as any actions */
export const { 
    set_time, 
    initial_set, 
    set_currentValue,
    set_expanded, 
    set_profile, 
    set_news, 
    set_buy_hold, 
    set_earnings, 
    set_newsExpanded,
    set_financials,
    set_measurement,
    set_yearlyChange,
    set_dailyChange
} = ChartUI.actions

export const selectGraphTickers = (state: RootState) => state.ChartUI.ticker
export const selectIsExpanded = (state: RootState) => state.ChartUI.isExpanded

/** this is extremely useful when creating class properties, passes only specific
 * ticker object. otherwise classes will rerender when any ticker in the key 
 * value list changes, significantly slows performance
 */
export const specGraphTicker = (state: RootState, ticker: string) => state.ChartUI.ticker[ticker] 
export const specEarnings = (state: RootState, ticker: string) => state.ChartUI.ticker[ticker].earnings
export const specBuyHold = (state: RootState, ticker: string) => state.ChartUI.ticker[ticker].buyHold

/**
 * will return the current price of the specified ticker
 */
// export const specGraphTickerPrice = (state: RootState, ticker: string) => state.ChartUI.ticker[ticker].price
export default ChartUI.reducer