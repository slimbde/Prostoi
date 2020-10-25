import { Action, Reducer } from 'redux';
import { Idle } from '../models/Idle'

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface GantState {
  shops: string[];
  idles: IdleSet | null
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface SetShops {
  type: 'SET_SHOPS',
  payload: string[]
}

export type Ceh = {
  [key: string]: Idle[]
}

export type IdleSet = {
  [key: string]: Ceh
}

export interface SetIdles {
  type: 'SET_IDLES',
  payload: IdleSet
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = SetShops | SetIdles

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  setShops: (shopList: string[]) => ({ type: 'SET_SHOPS', payload: shopList } as SetShops),
  setIdles: (idles: IdleSet) => ({ type: 'SET_IDLES', payload: idles } as SetIdles)
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<GantState> = (state: GantState | undefined, incomingAction: Action): GantState => {
  if (state === undefined)
    return { shops: [], idles: null };


  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'SET_SHOPS':
      return {
        ...state,
        shops: action.payload
      };

    case 'SET_IDLES':
      return {
        ...state,
        idles: action.payload
      }

    default:
      return state;
  }
};
