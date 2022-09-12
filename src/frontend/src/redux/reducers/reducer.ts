import ChartUI from "./ChartUI";
import navigation from "./navigation";
import MarketNews from "./MarketNews";
import HomePageReducer from "./HomePageReducer";
import { combineReducers } from "@reduxjs/toolkit";


const reducers = combineReducers({
    navigation,
    ChartUI,
    MarketNews,
    HomePageReducer
});

export default reducers;