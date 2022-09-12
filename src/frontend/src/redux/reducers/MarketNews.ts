import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MarketNewsData } from '../../types/MarketNews'
import type { RootState } from '../store'

/* create an interface to define variables for reducer */
export interface MarketNewsReducer {
    news: MarketNewsData[],
}

/* define the intial state of reducer vars */
const initalState: MarketNewsReducer = {
    news: [{
        headline: '',
        summary: '',
        source: '',
        image: '',
        url: '',
        category: '',
        time: ''
    }],
}

/* the create slice method actual creates the reducer.
   It also defines the redux actions on the reducer, as 
   well as the changing of any variable values 
*/
export const MarketNews = createSlice({
    name: "MarketNews",
    initialState: initalState,
    reducers: {
        add_news: (state, action: PayloadAction<MarketNewsData>) => {
            let exists = false;
            state.news.map((obj) => {
                if (action.payload.headline == obj.headline){
                    exists = true;
                }
            });
            if (!exists) {
                state.news.push(action.payload);
                state.news.sort((a,b) => (
                    // Number(a.time) - Number(b.time)
                 new Date(b.time).getTime() -  new Date(a.time).getTime()  
                ))
            }
        }
    }
})

/* export the reducer to be included in the store, as well as any actions */
export const { add_news } = MarketNews.actions
export default MarketNews.reducer