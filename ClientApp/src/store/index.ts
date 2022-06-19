import * as Stats from './StatsStore'
import * as Gant from './GantStore'
import * as LostSteel from './LostSteelStore'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";




// The top-level state object
export interface ApplicationState {
  gant: Gant.GantState
  lostSteel: LostSteel.LostState
  stats: Stats.StatsState
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
  gant: Gant.reducer,
  lostSteel: LostSteel.reducer,
  stats: Stats.reducer
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => Promise<void>, getState: () => ApplicationState): void;
}

export const useStateSelector = useSelector as TypedUseSelectorHook<ApplicationState>
