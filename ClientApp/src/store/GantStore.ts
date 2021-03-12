import { Action, Reducer } from 'redux';
import { IdleSet } from "../models/types/gant";


///////////////////////////////////// STATE
export interface GantState {
  shops: string[]
  idles: IdleSet | null
}


///////////////////////////////////// ACTIONS

export interface SetShops {
  type: 'SET_SHOPS',
  payload: string[]
}

export interface SetIdles {
  type: 'SET_IDLES',
  payload: IdleSet
}

export interface ClearIdles {
  type: "CLEAR_IDLES"
}

export type KnownAction = SetShops | SetIdles | ClearIdles


/////////////////////////////////////// ACTION CREATORS

export const actionCreators = {
  setShops: (shopList: string[]) => ({ type: 'SET_SHOPS', payload: shopList }),
  setIdles: (idles: IdleSet) => ({ type: 'SET_IDLES', payload: idles }),
  clearIdles: () => ({ type: "CLEAR_IDLES" })
};


/////////////////////////////////////// REDUCER

export const reducer: Reducer<GantState> = (state: GantState | undefined, incomingAction: Action): GantState => {
  if (state === undefined)
    return {
      shops: [],
      idles: null
    };


  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'SET_SHOPS':
      return {
        ...state,
        shops: action.payload
      }
    case 'SET_IDLES':
      return {
        ...state,
        idles: action.payload
      }
    case "CLEAR_IDLES":
      return {
        ...state,
        idles: null
      }

    default:
      return state;
  }
};
