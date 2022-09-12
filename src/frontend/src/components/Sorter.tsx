import React from 'react';
import { TickerType } from '../redux/reducers/ChartUI';
import { sortingOptions } from '../types/HomePage';

/** this function simply returns a sorted version of supported stocks */
function Sorter(
    supportedStocks: string[],
    sort:sortingOptions,
    graphTicker: TickerType,
    ):string[]{

    const sortMostPopular = ():string[] => {
        const popSort = [...supportedStocks];
        
        popSort.sort((a,b) => graphTicker[a].financials.Volume < graphTicker[b].financials.Volume ? 1 : graphTicker[a].financials.Volume > graphTicker[b].financials.Volume ? -1 : 0 )

        return popSort;
    }

    const sortMostExpensive = ():string[] => {
        const expSort = [...supportedStocks];
        
        expSort.sort((a,b) => Number(graphTicker[a].currentValues.Price.value) < Number(graphTicker[b].currentValues.Price.value) ? 1 : Number(graphTicker[a].currentValues.Price.value) > Number(graphTicker[b].currentValues.Price.value) ? -1 : 0 )

        return expSort;
    }

    const sortDailyMovers = ():string[] => {
        const daily = [...supportedStocks];
        
        daily.sort((a,b) => Math.abs(Number(graphTicker[a].dailyChange)) < Math.abs(Number(graphTicker[b].dailyChange)) ? 1 : Math.abs(Number(graphTicker[a].dailyChange)) > Math.abs(Number(graphTicker[b].dailyChange)) ? -1 : 0 )

        return daily;
    }

    const sortYearlyMovers = ():string[] => {
        const yearly = [...supportedStocks];
        
        yearly.sort((a,b) => Math.abs(Number(graphTicker[a].yearlyChange)) < Math.abs(Number(graphTicker[b].yearlyChange)) ? 1 : Math.abs(Number(graphTicker[a].yearlyChange)) > Math.abs(Number(graphTicker[b].yearlyChange)) ? -1 : 0 )

        return yearly;
    }

    switch(sort){
        case 'dailyMovers':
            return sortDailyMovers();
        case 'yearlyMovers':
            return sortYearlyMovers();
        case 'mostPopular':
            return sortMostPopular();
        case 'mostExpensive':
            return sortMostExpensive();
        default:
            return sortYearlyMovers();
    }
}

export default Sorter;

