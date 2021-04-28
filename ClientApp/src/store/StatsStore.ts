import { Action, Reducer } from 'redux';
import { Usage } from "../models/types/stats";


///////////////////////////////////// STATE
export interface StatsState {
  ips: string[]
  usages: Usage[]
}


///////////////////////////////////// ACTIONS

export interface SetIps {
  type: 'SET_IPS',
  payload: string[]
}

export interface SetUsages {
  type: "SET_USAGES",
  payload: Usage[]
}

export type KnownAction = SetIps | SetUsages


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  setIps: (ipList: string[]) => ({ type: 'SET_IPS', payload: ipList }),
  setUsages: (usageList: Usage[]) => ({ type: 'SET_USAGES', payload: usageList }),
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<StatsState> = (state: StatsState | undefined, incomingAction: Action): StatsState => {
  if (state === undefined)
    return {
      ips: [],
      usages: []
    };


  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'SET_IPS':
      return {
        ...state,
        ips: action.payload
      }
    case "SET_USAGES":
      return {
        ...state,
        usages: action.payload
      }

    default:
      return state;
  }
};
