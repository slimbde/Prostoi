import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { gantSlice } from "components/Gant/gant.slice"
import { lostSteelSlice } from "components/LostSteel/lostSteel.slice"
import { statsSlice } from "components/Stats/stats.slice"
import { idleApi } from "./api.idle"
import { statsApi } from "./api.stats"




export const store = configureStore({
  reducer: {
    gant: gantSlice.reducer,
    lostSteel: lostSteelSlice.reducer,
    stats: statsSlice.reducer,
    [idleApi.reducerPath]: idleApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
  },

  middleware: (options) => options().concat(idleApi.middleware, statsApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>


// Create browser history to use in the Redux store
// const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;


