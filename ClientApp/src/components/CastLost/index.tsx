import * as React from 'react'
import { drawChart } from './drawChart'
import { connect } from 'react-redux'
import * as am4core from "@amcharts/amcharts4/core";
import { ApplicationState } from '../../store';
import * as CastStore from '../../store/CastLost';
import { CastLostTable } from './table';
import './styles.css'


type CastLostProps = {
  castLosts: CastStore.CastLost[]
  lostIdles: CastStore.LostIdle[]
}


const CastLost: React.FC<CastLostProps> = (props: CastLostProps) => {
  React.useEffect(() => {
    if (!props.lostIdles)
      return

    drawChart(props.lostIdles)
    const chartDiv = document.querySelector(".losts-wrapper") as HTMLDivElement
    chartDiv.style.opacity = "1"

    return () => am4core.disposeAllCharts()
  }, [props.lostIdles])

  return <div className="losts-wrapper">
    <div id="chartdiv-loss" className="z-depth-5"></div>
    <CastLostTable castLosts={props.lostIdles} />
  </div>
}

export default connect(
  (state: ApplicationState) => state.castLost,
  CastStore.actionCreators
)(CastLost as any);
