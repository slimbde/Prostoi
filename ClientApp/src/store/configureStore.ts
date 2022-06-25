import thunk from 'redux-thunk';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { ApplicationState, reducers } from './';
import { createBrowserHistory, History } from 'history';




function configureStore(history: History, initialState?: ApplicationState) {
  const middleware = [
    thunk,
    routerMiddleware(history)
  ];

  const enhancers: never[] = [];
  const windowIfDefined = typeof window === 'undefined'
    ? null
    : window as any;

  if (windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__() as never)
  }

  return createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(...middleware), ...enhancers)
  );
}





// Create browser history to use in the Redux store
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;
export const history = createBrowserHistory({ basename: baseUrl });

export const rootReducer = combineReducers({
  ...reducers,
  router: connectRouter(history)
});

// Get the application-wide store instance, prepopulating with state from the server where available.
export const store = configureStore(history)

