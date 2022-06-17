import { Action, Reducer } from 'redux';
import { AppThunkAction } from ".";
import { IdleSet } from "../models/types/gant";
import db from "../models/handlers/DbHandler"


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

type StartLoading = { type: 'START_LOADING' }
type LoadingError = { type: 'LOADING_ERROR', error: any }
type SetShops = { type: 'SET_SHOPS', shops: string[] }
type SetIdles = { type: 'SET_IDLES', idles: IdleSet, currentShop: string }
type ClearIdles = { type: "CLEAR_IDLES" }

export type KnownAction = StartLoading | SetShops | LoadingError | SetIdles | ClearIdles


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  DOWNLOAD_SHOPS: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
    const state = getState().gant
    if (!state.loading) {
      try {
        dispatch({ type: 'START_LOADING' })
        const shops = await db.getShopsAsync()
        dispatch({ type: "SET_SHOPS", shops })
      } catch (error) {
        console.log(error)
        dispatch({ type: "LOADING_ERROR", error })
      }
    }
  },
  DOWNLOAD_IDLES: (bDate: string, eDate: string, currentShop: string): AppThunkAction<KnownAction> => async (dispatch, getState) => {
    const state = getState().gant
    if (!state.loading) {
      try {
        dispatch({ type: 'START_LOADING' })
        const idles = await db.getGantIdlesAsync(bDate, eDate, currentShop)

        dispatch({ type: "SET_IDLES", idles, currentShop })
      } catch (error) {
        console.log(error)
        dispatch({ type: "LOADING_ERROR", error })
      }
    }
  },
  CLEAR_IDLES: () => ({ type: "CLEAR_IDLES" })
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<GantState> = (state: GantState | undefined = InitialState, incomingAction: Action): GantState => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "START_LOADING": return ({ ...state, loading: true })
    case 'SET_SHOPS': return ({ ...state, shops: action.shops, loading: false, error: undefined })
    case 'SET_IDLES': return ({ ...state, idles: action.idles, loading: false, currentShop: action.currentShop, error: undefined })
    case "LOADING_ERROR": return ({ ...state, error: action.error, loading: false, })
    case "CLEAR_IDLES": return ({ ...state, idles: undefined })

    default: return InitialState
  }
};
