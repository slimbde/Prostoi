import { Action, Reducer } from 'redux';
import { Usage } from "../models/types/stats";
import db from "../models/handlers/DbHandler"
import { AppThunkAction } from "store";


///////////////////////////////////// STATE
export interface StatsState {
  loading: boolean
  ips: string[]
  usages?: Usage[]
  error?: any
  currentIp: string
}

const InitialState: StatsState = {
  loading: false,
  ips: [],
  usages: undefined,
  currentIp: "",
}


///////////////////////////////////// ACTIONS

type StartLoading = { type: 'START_LOADING' }
type LoadingError = { type: 'LOADING_ERROR', error: any }
type SetIps = { type: 'SET_IPS', ips: string[] }
type SetUsages = { type: 'SET_USAGES', usages: Usage[], ip: string }

export type KnownAction = SetIps | SetUsages | StartLoading | LoadingError


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  DOWNLOAD_IPS: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
    const state = getState().stats
    if (!state.loading) {
      try {
        dispatch({ type: 'START_LOADING' })
        const ips = (await db.getUsageIpsAsync()).sort((a, b) => {
          const a1 = a.replace(/\./g, "")
          const b1 = b.replace(/\./g, "")

          return a1 < b1 ? -1 : a1 > b1 ? 1 : 0
        })
        dispatch({ type: "SET_IPS", ips })
      } catch (error) {
        console.log(error)
        dispatch({ type: "LOADING_ERROR", error })
      }
    }
  },
  DOWNLOAD_USAGES: (bDate: string, eDate: string, ip: string): AppThunkAction<KnownAction> => async (dispatch, getState) => {
    const state = getState().stats
    if (!state.loading) {
      try {
        dispatch({ type: 'START_LOADING' })
        const usages = await db.getUsageForAsync(bDate, eDate, ip)
        dispatch({ type: "SET_USAGES", usages, ip })
      } catch (error) {
        console.log(error)
        dispatch({ type: "LOADING_ERROR", error })
      }
    }
  },
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<StatsState> = (state: StatsState | undefined = InitialState, incomingAction: Action): StatsState => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "START_LOADING": return ({ ...state, loading: true })
    case 'SET_IPS': return ({ ...state, ips: action.ips, loading: false, error: undefined })
    case 'SET_USAGES': return ({ ...state, usages: action.usages, loading: false, currentIp: action.ip, error: undefined })
    case "LOADING_ERROR": return ({ ...state, error: action.error, loading: false, })

    default: return InitialState
  }
};
