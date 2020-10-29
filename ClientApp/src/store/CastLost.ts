import { Action, Reducer } from 'redux';



//////////////// TYPES
export type CastLost = {
  date: string,
  val1: number,
  val2: number
}

export type LostIdle = {
  date: string,
  lostMetal: number,
}


//////////////////////////////////////// STATE
export interface CastLostState {
  castLosts: CastLost[],
  lostIdles: LostIdle[] | null
}


///////////////////////////////////////// ACTIONS
export interface SetCastLosts {
  type: 'SET_CAST_LOSTS',
  payload: CastLost[]
}

export interface SetLostIdles {
  type: "SET_LOST_IDLES",
  payload: LostIdle[]
}

export interface ClearLostIdles {
  type: "CLEAR_LOST_IDLES"
}

export type KnownAction = SetCastLosts | SetLostIdles | ClearLostIdles


//////////////////////////////////////////////// ACTION CREATORS
export const actionCreators = {
  setCastLosts: (castLosts: CastLost[]) => ({ type: 'SET_CAST_LOSTS', payload: castLosts } as SetCastLosts),
  setLostIdles: (lostIdles: LostIdle[]) => ({ type: "SET_LOST_IDLES", payload: lostIdles } as SetLostIdles),
  clearLostIdles: () => ({ type: "CLEAR_LOST_IDLES" }),
}


///////////////////////////// REDUCER
export const reducer: Reducer<CastLostState> = (state: CastLostState | undefined, incomingAction: Action): CastLostState => {
  if (state === undefined)
    return { castLosts: [], lostIdles: null };


  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'SET_CAST_LOSTS':
      return {
        ...state,
        castLosts: action.payload
      }
    case "SET_LOST_IDLES":
      return {
        ...state,
        lostIdles: action.payload
      }
    case "CLEAR_LOST_IDLES":
      return {
        ...state,
        lostIdles: null
      }

    default:
      return state;
  }
};