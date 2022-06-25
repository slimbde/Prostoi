import "../Layout/sidepanel.scss"
import * as am4core from "@amcharts/amcharts4/core";
import React, { useEffect } from 'react';
import GantSidePanel from "./gantSidePanel";
import { useActions, useStateSelector } from '../../store';
import { drawChart } from './drawChart';





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

