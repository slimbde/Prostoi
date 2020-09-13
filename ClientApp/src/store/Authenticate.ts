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

const initialdState: AuthenticateState = {
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

interface RequestAuthenticateAction {
  type: 'REQUEST_AUTHENTICATE';
}

interface ReceiveAuthenticateAction {
  type: 'RECEIVE_AUTHENTICATE';
  payload: IAuthData
}

interface RequestLogoutAction {
  type: 'REQUEST_LOGOUT'
}

interface RequestLoginAction {
  type: 'REQUEST_LOGIN',
  payload: IAuthData
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestAuthenticateAction | ReceiveAuthenticateAction | RequestLogoutAction | RequestLoginAction;


/////////////////// ACTION CREATORS 
// These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  requestAuthenticate: (login: string, password: string): AppThunkAction<KnownAction> => (dispatch, getState) => {

    // appState is of type ApplicationState(look into index.ts)
    const appState = getState();

    // Only load data if it's something we don't already have (and are not already loading)
    if (appState && appState.authenticate) {
      fetch(`api/user/authenticate?login=${login}&password=${password}`)
        .then(response => (response.json() as Promise<IAuthData>))
        .then(data => {
          dispatch({
            type: 'RECEIVE_AUTHENTICATE',
            payload: {
              user: data.user,
              role: data.role,
              error: data.error,
            }
          })
        })

      dispatch({ type: 'REQUEST_AUTHENTICATE' });
    }
  },
  requestLogin: (data: IAuthData): AppThunkAction<KnownAction> => (dispatch, getState) =>
    dispatch({
      type: 'REQUEST_LOGIN',
      payload: {
        user: data.user,
        role: data.role,
        error: null
      }
    }),
  requestLogout: (): AppThunkAction<KnownAction> => (dispatch, getState) =>
    dispatch({ type: 'REQUEST_LOGOUT' })

};

////////////////////// REDUCER 
// For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<AuthenticateState> = (state: AuthenticateState | undefined, incomingAction: Action): AuthenticateState => {
  if (state === undefined)
    return initialdState;

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_AUTHENTICATE':
      return state;

    case 'RECEIVE_AUTHENTICATE':
      return {
        logged: action.payload.user ? true : false,
        authData: {
          user: action.payload.user,
          role: action.payload.role,
          error: action.payload.error,
        },
      };

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
