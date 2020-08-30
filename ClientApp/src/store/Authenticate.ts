import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';


// -----------------
// STATE - This defines the type of data maintained in the Redux store.

interface IAuthData {
  user: any,
  userRole: any,
  error: string | null
}

export interface AuthenticateState {
  logged: boolean,
  login: string | null,
  password: string | null,
  authData: IAuthData,
}


// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestAuthenticateAction {
  type: 'REQUEST_AUTHENTICATE';
  payload: {
    login: string,
    password: string,
  }
}

interface ReceiveAuthenticateAction {
  type: 'RECEIVE_AUTHENTICATE';
  payload: {
    login: string,
    password: string,
    user: any,
    userRole: any,
    error: string | null,
  }
}

interface RequestLogout {
  type: 'REQUEST_LOGOUT'
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestAuthenticateAction | ReceiveAuthenticateAction | RequestLogout;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  requestAuthenticate: (login: string, password: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    //// appState is of type ApplicationState(look into index.ts)
    const appState = getState();

    // Only load data if it's something we don't already have (and are not already loading)
    if (appState && appState.authenticate) {
      fetch(`weatherforecast?login=${login}&password=${password}`)
        .then(response => (response.json() as Promise<IAuthData>))
        .then(data => dispatch({
          type: 'RECEIVE_AUTHENTICATE',
          payload: {
            login: login,
            password: password,
            user: !data.error && data.user,
            userRole: !data.error && data.userRole,
            error: data.error || null,
          }
        }))

      dispatch({ type: 'REQUEST_AUTHENTICATE', payload: { login: login, password: password } });
    }
  },
  requestLogout: (): AppThunkAction<KnownAction> => (dispatch, getState) => dispatch({ type: 'REQUEST_LOGOUT' })

};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const initialdState: AuthenticateState = {
  logged: false,
  login: null,
  password: null,
  authData: {
    user: null,
    userRole: null,
    error: null
  },
};

export const reducer: Reducer<AuthenticateState> = (state: AuthenticateState | undefined, incomingAction: Action): AuthenticateState => {
  if (state === undefined)
    return initialdState;

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_AUTHENTICATE':
      return {
        ...state,
        login: action.payload.login,
        password: action.payload.password
      };
    case 'RECEIVE_AUTHENTICATE':
      //if (action.payload.login === state.login && action.payload.password === state.password) {
      return {
        logged: action.payload.user ? true : false,
        login: action.payload.login,
        password: action.payload.password,
        authData: {
          user: action.payload.user,
          userRole: action.payload.userRole,
          error: action.payload.error
        },
      };
    //}
    //break;
    case 'REQUEST_LOGOUT':
      return {
        ...state,
        logged: false
      };
  }

  return state;
};
