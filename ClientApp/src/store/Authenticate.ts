import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';


/////////////////// STATE 
// This defines the type of data maintained in the Redux store.

export interface IAuthData {
  user: any,
  role: any,
  error: string | null,
}

export interface AuthenticateState {
  logged: boolean,
  authData: IAuthData,
}

const initialState: AuthenticateState = {
  logged: false,
  authData: {
    user: null,
    role: null,
    error: null,
  },
};


//////////////////// ACTIONS 
// These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface LogoutAction {
  type: 'REQUEST_LOGOUT'
}

interface LoginAction {
  type: 'REQUEST_LOGIN',
  payload: IAuthData
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = LogoutAction | LoginAction;


/////////////////// ACTION CREATORS 
// These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  requestLogin: (data: IAuthData): AppThunkAction<KnownAction> => (dispatch, getState) =>
    dispatch({
      type: 'REQUEST_LOGIN',
      payload: data
    }),
  requestLogout: (): AppThunkAction<KnownAction> => (dispatch, getState) =>
    dispatch({ type: 'REQUEST_LOGOUT' })

};

////////////////////// REDUCER 
// For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<AuthenticateState> = (state: AuthenticateState | undefined, incomingAction: Action): AuthenticateState => {
  if (state === undefined)
    return initialState;

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_LOGIN':
      return {
        ...state,
        logged: true,
        authData: action.payload,
      };

    case 'REQUEST_LOGOUT':
      return {
        ...state,
        logged: false
      };
  }

  return state;
};
