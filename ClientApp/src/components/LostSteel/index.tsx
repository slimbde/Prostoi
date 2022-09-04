import * as React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import { drawChart } from './drawChart'
import LostSteelSidePanel from "./LostSteelSidePanel";
import { LostSteelTable } from './LostSteelTable';
import '../Layout/sidepanel.scss'
import './lostSteel.scss'
import { useStateSelector } from "store-toolkit/hooks";




export default () => {
  const { lostSteel } = useStateSelector(appState => appState.lostSteel)

  React.useEffect(() => {
    if (!lostSteel || lostSteel.length === 0) return

    drawChart(lostSteel)

    return () => am4core.disposeAllCharts()
  }, [lostSteel])


  return <>
    <LostSteelSidePanel />
    <div className="losts-wrapper">
      <div id="chartdiv"></div>
      {lostSteel && <LostSteelTable lostSteel={lostSteel} />}
    </div>
  </>
}

