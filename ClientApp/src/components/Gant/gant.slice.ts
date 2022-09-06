import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";


//////////// STATE
export interface GantState {
  currentShop?: string
  bDate: string
  eDate: string
}

const initialDate = moment().format("YYYY-MM-DD")

const initialState: GantState = {
  currentShop: undefined,
  bDate: initialDate,
  eDate: initialDate,
}



///////////// ASYNC ACTIONS





//////// SLICE
export const gantSlice = createSlice({
  name: "gant",
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


export const gantActionCreators = {
  ...gantSlice.actions,
}
