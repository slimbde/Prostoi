import ReactDOM from "react-dom";
import * as React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import * as CastStore from '../../store/LostCastStore';
import { drawChart } from './drawChart'
import { connect } from 'react-redux'
import { LostCastSidePanel } from "./lostCastSidePanel";
import { ApplicationState } from '../../store';
import { CastLostTable } from './table';
import { LostCast } from "../../models/types/lostCast";
import '../Layout/sidepanel.css'
import './lost-styles.css'


type CastLostProps = {
  lostCasts: LostCast[]
  setLostCasts: (data: LostCast[]) => CastStore.KnownAction
  clearLostCasts: () => CastStore.KnownAction
}


const CastLost: React.FC<CastLostProps> = (props: CastLostProps) => {
  const pageWrapper = document.querySelector(".losts-wrapper") as HTMLDivElement

  React.useEffect(() => {
    const sidepanel = document.getElementById("sidepanel") as HTMLDivElement
    ReactDOM.render(
      <LostCastSidePanel
        shops={["МНЛЗ-2", "МНЛЗ-5"]}
        setLostCasts={props.setLostCasts}
      />, sidepanel)

    return () => { props.clearLostCasts() }
  }, [])

  React.useEffect(() => {
    if (!props.lostCasts || props.lostCasts.length === 0)
      return

    drawChart(props.lostCasts)
    pageWrapper.style.opacity = "1"

    return () => am4core.disposeAllCharts()
  }, [props.lostCasts])

  return <div className="losts-wrapper">
    <div id="chartdiv-loss"></div>
    <CastLostTable lostCasts={props.lostCasts} />
  </div>
}

export default connect(
  (state: ApplicationState) => state.lostCast,
  CastStore.actionCreators
)(CastLost as any);
