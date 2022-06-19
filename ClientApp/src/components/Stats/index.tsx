import "./stats.scss"
import React from 'react';
import { useStateSelector } from '../../store';
import StatsSidePanel from "./statsSidePanel";
import { StatsTable } from "./statsTable";





export default () => {
  const { usages } = useStateSelector(appState => appState.stats)

  return <>
    <StatsSidePanel />
    {usages && usages.length > 0 && <StatsTable usages={usages} />}
  </>
}
