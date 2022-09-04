import "../Layout/sidepanel.scss"
import * as am4core from "@amcharts/amcharts4/core";
import React, { useEffect } from 'react';
import GantSidePanel from "./gantSidePanel";
import { drawChart } from './drawChart';
import { useStateSelector } from "store-toolkit/hooks";





export default () => {
  const { idles } = useStateSelector(appState => appState.gant)

  useEffect(() => {
    if (!idles) return
    drawChart(idles)

    return () => am4core.disposeAllCharts()
  }, [idles])

  return <>
    <GantSidePanel />
    <div id="chartdiv"></div>
  </>
}

