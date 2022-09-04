import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdleSet } from "models/types/gant";
import db from "models/handlers/DbHandler"
import { SET_ERROR, SET_LOADING } from "store-toolkit/utils";


//////////// STATE
export interface GantState {
  loading: boolean
  shops: string[]
  idles?: IdleSet
  error?: any
  currentShop?: string
}

const initialState: GantState = {
  loading: false,
  shops: [],
  idles: undefined,
  currentShop: undefined,
}



///////////// ASYNC ACTIONS
const DOWNLOAD_SHOPS = createAsyncThunk(
  'gant/DOWNLOAD_SHOPS',
  async () => {
    const shops = await db.getShopsAsync()
    return shops
  }
)

const DOWNLOAD_IDLES = createAsyncThunk(
  'gant/DOWNLOAD_IDLES',
  async ({ bDate, eDate, currentShop }: { bDate: string, eDate: string, currentShop: string }) => {
    const idles = await db.getGantIdlesAsync(bDate, eDate, currentShop)
    return ({ idles, currentShop })
  }
)




//////// SLICE
export const gantSlice = createSlice({
  name: "gant",
  initialState,
  reducers: {


  },
  extraReducers: builder => {
    builder
      .addCase(DOWNLOAD_SHOPS.pending, SET_LOADING)
      .addCase(DOWNLOAD_SHOPS.rejected, SET_ERROR)
      .addCase(DOWNLOAD_SHOPS.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false
        state.error = undefined
        state.shops = action.payload
      })
      .addCase(DOWNLOAD_IDLES.pending, SET_LOADING)
      .addCase(DOWNLOAD_IDLES.rejected, SET_ERROR)
      .addCase(DOWNLOAD_IDLES.fulfilled, (state, action: PayloadAction<{ idles: IdleSet, currentShop: string }>) => {
        state.loading = false
        state.error = undefined
        state.idles = action.payload.idles
        state.currentShop = action.payload.currentShop
      })
  }
})


export const gantActionCreators = {
  ...gantSlice.actions,
  DOWNLOAD_IDLES,
  DOWNLOAD_SHOPS,
}
