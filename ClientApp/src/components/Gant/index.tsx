import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { drawChart } from './drawChart';
import * as GantStore from '../../store/GantStore';
import * as am4core from "@amcharts/amcharts4/core";
import { IdleSet } from "../../models/types/gant";
import { GantSidePanel } from "./gantSidePanel";
import { dbProxy } from "../../models/handlers/DbProxy";
import ReactDOM from "react-dom";
import "../Layout/sidepanel.css"



type GantProps = {
  idles: IdleSet
  setIdles: (idleSet: IdleSet) => GantStore.KnownAction
  clearIdles: () => GantStore.KnownAction
}



const Gant: React.FC<GantProps> = (props: GantProps) => {
  let pending = false // abort flag

  useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl.style.display = "block"
    loadingEl.style.opacity = "1"

    pending = true
    dbProxy.getShopsAsync()
      .then(async shops => {
        if (pending) {
          loadingEl.style.opacity = "0"
          const sidepanel = document.getElementById("sidepanel") as HTMLDivElement
          shops.length > 0 && ReactDOM.render(<GantSidePanel shops={shops} setIdles={props.setIdles} />, sidepanel)
        }
      })
      .catch(data => {
        dbProxy.remove("getShopsAsync")
        console.error(data)
        loadingEl.style.opacity = "0"
      })

    return () => {
      pending = false
      props.clearIdles()
    }
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
