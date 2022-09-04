import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SET_ERROR, SET_LOADING } from "store-toolkit/utils";
import { Usage } from "models/types/stats";
import db from "models/handlers/DbHandler"




//////////////// STATE
export interface StatsState {
  loading: boolean
  ips: string[]
  usages?: Usage[]
  error?: any
  currentIp: string
}

const initialState: StatsState = {
  loading: false,
  ips: [],
  usages: undefined,
  currentIp: "",
}



const DOWNLOAD_IPS = createAsyncThunk(
  "stats/DOWNLOAD_IPS",
  async () => {
    const ips = (await db.getUsageIpsAsync()).sort((a, b) => {
      const a1 = a.replace(/\./g, "")
      const b1 = b.replace(/\./g, "")

      return a1 < b1 ? -1 : a1 > b1 ? 1 : 0
    })
    return ips
  }
)

const DOWNLOAD_USAGES = createAsyncThunk(
  "stats/DOWNLOAD_USAGES",
  async ({ bDate, eDate, ip }: { bDate: string, eDate: string, ip: string }) => {
    return {
      usages: await db.getUsageForAsync(bDate, eDate, ip),
      currentIp: ip
    }
  }
)




/////////////// SLICE
export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {

  },
  extraReducers: builder => {
    builder
      .addCase(DOWNLOAD_IPS.pending, SET_LOADING)
      .addCase(DOWNLOAD_IPS.rejected, SET_ERROR)
      .addCase(DOWNLOAD_IPS.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.ips = action.payload
        state.loading = false
        state.error = undefined
      })
      .addCase(DOWNLOAD_USAGES.pending, SET_LOADING)
      .addCase(DOWNLOAD_USAGES.rejected, SET_ERROR)
      .addCase(DOWNLOAD_USAGES.fulfilled, (state, action: PayloadAction<{ usages: Usage[], currentIp: string }>) => {
        state.currentIp = action.payload.currentIp
        state.usages = action.payload.usages
        state.loading = false
        state.error = undefined
      })
  }
})


export const statsActionCreators = {
  ...statsSlice.actions,
  DOWNLOAD_IPS,
  DOWNLOAD_USAGES,
}