import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";




//////////////// STATE
export interface StatsState {
  currentIp: string
  bDate: string
  eDate: string
}

const initialState: StatsState = {
  currentIp: "",
  bDate: moment().subtract(2, "week").format("YYYY-MM-DD"),
  eDate: moment().format("YYYY-MM-DD"),
}





/////////////// SLICE
export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    SET_CURRENT_IP: (state, action: PayloadAction<string>) => {
      state.currentIp = action.payload
    },

    SET_DATES: (state, action: PayloadAction<{ bDate: string, eDate: string }>) => {
      state.bDate = action.payload.bDate
      state.eDate = action.payload.eDate
    }
  },
  extraReducers: builder => {
  }
})


export const statsActionCreators = {
  ...statsSlice.actions,
}