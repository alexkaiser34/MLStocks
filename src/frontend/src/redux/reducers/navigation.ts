import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/* create an interface to define variables for reducer */
interface NavState {
    page: string
}

/* define the intial state of reducer vars */
const initalState: NavState = {
    page: 'Home'
}

/* the create slice method actual creates the reducer.
   It also defines the redux actions on the reducer, as 
   well as the changing of any variable values 
*/
export const navigation = createSlice({
    name: "navigation",
    initialState: initalState,
    reducers: {
        switch_page: (state, action: PayloadAction<string>) => {
            state.page = action.payload
        },
    }
})

/* export the reducer to be included in the store, as well as any actions */
export const { switch_page } = navigation.actions
export const selectNav = (state: RootState) => state.navigation.page
export default navigation.reducer