import thunk from 'redux-thunk';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { ApplicationState, reducers } from './';
import { History } from 'history';

export default function configureStore(history: History, initialState?: ApplicationState) {
  const middleware = [
    thunk,
    routerMiddleware(history)
  ];

  const rootReducer = combineReducers({
    ...reducers,
    router: connectRouter(history)
  });

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
