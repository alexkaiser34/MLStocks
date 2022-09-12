import { configureStore } from '@reduxjs/toolkit';
import reducers from './reducers/reducer';

const store = configureStore({
    reducer: reducers,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;


