import { Action, Reducer } from 'redux';
import { IdleSet } from "../models/types/gant";
import db from "../models/handlers/DbHandler"
import { actionCreators as statsActionCreators } from "./StatsStore";
import { AppThunkAction } from "store";




///////////////////////////////////// STATE
export interface GantState {
  loading: boolean
  shops: string[]
  idles?: IdleSet
  error?: any
  currentShop?: string
}

const InitialState: GantState = {
  loading: false,
  shops: [],
  idles: undefined,
  currentShop: undefined,
}


///////////////////////////////////// ACTIONS

type StartLoading = { type: 'GANT_START_LOADING' }
type LoadingError = { type: 'GANT_LOADING_ERROR', error: any }
type SetShops = { type: 'GANT_SET_SHOPS', shops: string[] }
type SetIdles = { type: 'GANT_SET_IDLES', idles: IdleSet, currentShop: string }


export type KnownAction = StartLoading | SetShops | LoadingError | SetIdles


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  DOWNLOAD_SHOPS: (): AppThunkAction<Promise<void>> => async (dispatch, getState) => {
    const state = getState().gant
    if (!state.loading) {
      try {
        dispatch({ type: 'GANT_START_LOADING' })
        const shops = await db.getShopsAsync()
        dispatch({ type: "GANT_SET_SHOPS", shops })
      } catch (error) {
        console.log(error)
        dispatch({ type: "GANT_LOADING_ERROR", error })
      }
    }
  },
  DOWNLOAD_IDLES: (bDate: string, eDate: string, currentShop: string): AppThunkAction<Promise<void>> => async (dispatch, getState) => {
    const state = getState().gant
    if (!state.loading) {
      try {
        dispatch({ type: 'GANT_START_LOADING' })
        const idles = await db.getGantIdlesAsync(bDate, eDate, currentShop)

        dispatch({ type: "GANT_SET_IDLES", idles, currentShop })
      } catch (error) {
        console.log(error)
        dispatch({ type: "GANT_LOADING_ERROR", error })
      }
    }
  },
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<GantState> = (state: GantState = InitialState, incomingAction: Action): GantState => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "GANT_START_LOADING": return ({ ...state, loading: true })
    case 'GANT_SET_SHOPS': return ({ ...state, shops: action.shops, loading: false, error: undefined })
    case 'GANT_SET_IDLES': return ({ ...state, idles: action.idles, loading: false, currentShop: action.currentShop, error: undefined })
    case "GANT_LOADING_ERROR": return ({ ...state, error: action.error, loading: false, })

    default: return state
  }
};
