import {createSlice,nanoid} from '@reduxjs/toolkit'

const initialState = {
    buses: [],
    user: null,
    busid: null,
}
export const busSlice = createSlice({
    name: 'rttt',
    initialState,
    reducers: {
        changeBus: (state,action) => {
            state.buses = action.payload
        },
        updateUser: (state,action) =>{
            state.user = action.payload
        },
        setBusid: (state,action) => {
            state.busid = action.payload
        }
    }
})
export const {changeBus,updateUser,setBusid} = busSlice.actions 
export default busSlice.reducer
