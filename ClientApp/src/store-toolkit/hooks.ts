import { bindActionCreators } from "@reduxjs/toolkit";
import { gantActionCreators } from "components/Gant/gant.slice";
import { lostSteelActionCreators } from "components/LostSteel/lostSteel.slice";
import { statsActionCreators } from "components/Stats/stats.slice";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "store-toolkit";



// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useStateSelector: TypedUseSelectorHook<RootState> = useSelector;


// the hook to retrieve action creators within FC. Dispatch is already bound so no need to call it explicitly 
export const useActions = () => {
  const dispatch = useAppDispatch();

  return {
    gant: bindActionCreators(gantActionCreators, dispatch),
    lostSteel: bindActionCreators(lostSteelActionCreators, dispatch),
    stats: bindActionCreators(statsActionCreators, dispatch),
    // another slices...
  }
}