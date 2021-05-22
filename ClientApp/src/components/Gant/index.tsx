import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { drawChart } from './drawChart';
import * as GantStore from '../../store/GantStore';
import * as am4core from "@amcharts/amcharts4/core";
import { IdleSet } from "../../models/types/gant";
import { GantSidePanel } from "./gantSidePanel";
import { dbHandler } from "../../models/handlers/DbHandler";
import ReactDOM from "react-dom";
import "../Layout/sidepanel.css"



type GantProps = {
  idles: IdleSet
  setIdles: (idleSet: IdleSet) => GantStore.KnownAction
  clearIdles: () => GantStore.KnownAction
}



const Gant: React.FC<GantProps> = (props: GantProps) => {
  useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl.style.opacity = "1"

    dbHandler.getShopsAsync()
      .then(shops => {
        loadingEl.style.opacity = "0"
        const sidepanel = document.getElementById("sidepanel") as HTMLDivElement
        shops.length > 0 && ReactDOM.render(<GantSidePanel shops={shops} setIdles={props.setIdles} />, sidepanel)
      })
      .catch(data => {
        console.error(data)
        loadingEl.style.opacity = "1"
      })

    return () => { props.clearIdles() }
  }, [])

  useEffect(() => {
    if (!props.idles)
      return

    drawChart(props.idles)

    return () => am4core.disposeAllCharts()
  }, [props.idles])

  return <div id="chartdiv"></div>
};

export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(Gant as any);
