import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LostSteel } from "models/types/lostSteel";
import db from "models/handlers/DbHandler"
import { SET_ERROR, SET_LOADING } from "store-toolkit/utils";




//////////////// STATE
export interface LostState {
  loading: boolean
  shops: string[]
  lostSteel?: LostSteel[]
  error?: any
  currentShop?: string
}

const initialState: LostState = {
  loading: false,
  shops: ["МНЛЗ-3", "МНЛЗ-4", "МНЛЗ-5"],
  lostSteel: undefined,
  currentShop: "",
}



const DOWNLOAD_LOSTS = createAsyncThunk(
  "lostSteel/DOWNLOAD_LOSTS",
  async ({ bDate, eDate, newShop }: { bDate: string, eDate: string, newShop: string }) => {
    const rawLosts = await db.getCcmLostSteelAsync(bDate, eDate, +newShop.split("-")[1])
    const losts = rawLosts.map(l => {
      const totalWeight = l.DOWNTIME_WEIGHT + l.IDLE_WEIGHT | 1;
      return ({
        ...l,
        IDLE_PERCENT: Math.round(l.IDLE_WEIGHT / totalWeight * 100),
        DOWNTIME_PERCENT: Math.round(l.DOWNTIME_WEIGHT / totalWeight * 100),
        SHIFT: l.SHIFT.slice(0, 10),
      })
    })
    return { losts, newShop }
  }
)




/////////////// SLICE
export const lostSteelSlice = createSlice({
  name: "lostSteel",
  initialState,
  reducers: {

  },
  extraReducers: builder => {
    builder
      .addCase(DOWNLOAD_LOSTS.pending, SET_LOADING)
      .addCase(DOWNLOAD_LOSTS.rejected, SET_ERROR)
      .addCase(DOWNLOAD_LOSTS.fulfilled, (state, action: PayloadAction<{ losts: LostSteel[], newShop: string }>) => {
        state.lostSteel = action.payload.losts
        state.currentShop = action.payload.newShop
        state.loading = false
        state.error = undefined
      })
  }
})


export const lostSteelActionCreators = {
  ...lostSteelSlice.actions,
  DOWNLOAD_LOSTS,
}