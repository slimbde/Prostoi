import { Action, Reducer } from 'redux';



//////////////// TYPES
export type LostCast = {
  date: string,
  lostIdle: number,
  lostEfficiency: number,
  lostIdlePercent: number,
  lostEfficiencyPercent: number,
}


//////////////////////////////////////// STATE
export interface LostCastState {
  lostCasts: LostCast[] | null
}


///////////////////////////////////////// ACTIONS
export interface SetLostCasts {
  type: "SET_LOST_CASTS",
  payload: LostCast[]
}

export interface ClearLostCasts {
  type: "CLEAR_LOST_CASTS"
}

export type KnownAction = SetLostCasts | ClearLostCasts


//////////////////////////////////////////////// ACTION CREATORS
export const actionCreators = {
  setLostCasts: (lostCasts: LostCast[]) => ({ type: "SET_LOST_CASTS", payload: lostCasts } as SetLostCasts),
  clearLostCasts: () => ({ type: "CLEAR_LOST_CASTS" }),
}


///////////////////////////// REDUCER
export const reducer: Reducer<LostCastState> = (state: LostCastState | undefined, incomingAction: Action): LostCastState => {
  if (state === undefined)
    return { lostCasts: null };


  const action = incomingAction as KnownAction;
  switch (action.type) {
    case "SET_LOST_CASTS":
      return {
        ...state,
        lostCasts: action.payload
      }
    case "CLEAR_LOST_CASTS":
      return {
        ...state,
        lostCasts: null
      }

    default:
      return state;
  }
};