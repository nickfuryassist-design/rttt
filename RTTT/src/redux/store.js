import { configureStore } from "@reduxjs/toolkit";
import busReducer from './rtttSlice'

export const store = configureStore({
    reducer: busReducer
})