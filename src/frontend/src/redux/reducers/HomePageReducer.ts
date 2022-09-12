import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { supported_stocks } from '../../supported_stocks'
import { sortingOptions, sortOps } from '../../types/HomePage'
import type { RootState } from '../store'

/* create an interface to define variables for reducer */
interface HomePageReducer {
    sortingOps: sortOps,
    currentSort: sortingOptions,
    supportedStock: string[]
}

/* define the intial state of reducer vars */
const initalState: HomePageReducer = {
    sortingOps: {
        dailyMovers: false,
        yearlyMovers: false,
        mostPopular: false,
        mostExpensive: true,
    },
    currentSort: 'mostExpensive',
    supportedStock: supported_stocks
}

/* the create slice method actual creates the reducer.
   It also defines the redux actions on the reducer, as 
   well as the changing of any variable values 
*/
export const HomePageReducer = createSlice({
    name: "HomePageReducer",
    initialState: initalState,
    reducers: {
        moveSort: (state, action: PayloadAction<sortOps>) => {
            state.sortingOps = action.payload;
            // Object.entries(state.sortingOps).map(([key,value]) => {
            //     if (value == true){
            //         state.currentSort = key as sortingOptions;
            //     }
            // })
        }

    }
})

/* export the reducer to be included in the store, as well as any actions */
export const { moveSort } = HomePageReducer.actions
export default HomePageReducer.reducer