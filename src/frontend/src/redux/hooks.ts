import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


// saves repetitive code, learn more at https://redux.js.org/usage/usage-with-typescript

// quick example 
// const count = useSelector((state) => state.value);
// const dispatch = useDispatch();