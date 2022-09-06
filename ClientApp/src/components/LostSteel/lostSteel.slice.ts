import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";



//////////////// STATE
export interface LostState {
  currentShop?: string
  shops: string[]
  bDate: string
  eDate: string
}


const initialState: LostState = {
  shops: ["МНЛЗ-3", "МНЛЗ-4", "МНЛЗ-5"],
  currentShop: "",
  bDate: moment().subtract(2, "week").format("YYYY-MM-DD"),
  eDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
}






/////////////// SLICE
export const lostSteelSlice = createSlice({
  name: "lostSteel",
  initialState,
  reducers: {
    SET_CURRENT_SHOP: (state, action: PayloadAction<string>) => { state.currentShop = action.payload },

    SET_DATES: (state, action: PayloadAction<{ bDate: string, eDate: string }>) => {
      state.bDate = action.payload.bDate
      state.eDate = action.payload.eDate
    }
  },
  extraReducers: builder => {

  }
})


export const lostSteelActionCreators = {
  ...lostSteelSlice.actions,
}