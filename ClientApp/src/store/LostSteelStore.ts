import { Action, Reducer } from 'redux';
import { AppThunkAction } from ".";
import { LostSteel } from "../models/types/lostSteel";
import db from "models/handlers/DbHandler"


///////////////////////////////////// STATE
export interface LostState {
  loading: boolean
  shops: string[]
  lostSteel?: LostSteel[]
  error?: any
  currentShop?: string
}

const InitialState: LostState = {
  loading: false,
  shops: ["МНЛЗ-3", "МНЛЗ-4", "МНЛЗ-5"],
  lostSteel: undefined,
  currentShop: "",
}


///////////////////////////////////// ACTIONS

type StartLoading = { type: 'START_LOADING' }
type LoadingError = { type: 'LOADING_ERROR', error: any }
type SetLosts = { type: 'SET_LOSTS', losts: LostSteel[], newShop: string }

export type KnownAction = StartLoading | SetLosts | LoadingError


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  DOWNLOAD_LOSTS: (bDate: string, eDate: string, newShop: string): AppThunkAction<Promise<void>> => async (dispatch, getState) => {
    const state = getState().lostSteel

    if (!state.loading) {
      try {
        dispatch({ type: 'START_LOADING' })

        const losts = await db.getCcmLostSteelAsync(bDate, eDate, +newShop.split("-")[1])
        losts.forEach(one => {
          const totalWeight = (one.DOWNTIME_WEIGHT + one.IDLE_WEIGHT) | 1;
          (one as any).IDLE_PERCENT = Math.round(one.IDLE_WEIGHT / totalWeight * 100);
          (one as any).DOWNTIME_PERCENT = Math.round(one.DOWNTIME_WEIGHT / totalWeight * 100)

          one.SHIFT = one.SHIFT.slice(0, 10)
        })

        dispatch({ type: "SET_LOSTS", losts, newShop })
      } catch (error) {
        console.log(error)
        dispatch({ type: "LOADING_ERROR", error })
      }
    }
  },
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<LostState> = (state: LostState = InitialState, incomingAction: Action): LostState => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "START_LOADING": return ({ ...state, loading: true })
    case 'SET_LOSTS': return ({ ...state, lostSteel: action.losts, loading: false, currentShop: action.newShop, error: undefined })
    case "LOADING_ERROR": return ({ ...state, error: action.error, loading: false, })

    default: return state
  }
};
