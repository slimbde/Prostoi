import "./stats.scss"
import React from 'react';
import StatsSidePanel from "./statsSidePanel";
import { StatsTable } from "./statsTable";
import { useStateSelector } from "store-toolkit/hooks";





export default () => {
  const { usages } = useStateSelector(appState => appState.stats)

  return <>
    <StatsSidePanel />
    {usages && usages.length > 0 && <StatsTable usages={usages} />}
  </>
}
