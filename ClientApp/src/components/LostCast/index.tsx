import * as React from 'react'
import { drawChart } from './drawChart'
import { connect } from 'react-redux'
import * as am4core from "@amcharts/amcharts4/core";
import { ApplicationState } from '../../store';
import * as CastStore from '../../store/LostCast';
import { CastLostTable } from './table';
import './styles.css'
import { errorHandler } from '../utils/errorHandler';


type CastLostProps = {
  lostCasts: CastStore.LostCast[]
}


const CastLost: React.FC<CastLostProps> = (props: CastLostProps) => {
  React.useEffect(() => {
    if (!props.lostCasts)
      return

    if ("error" in props.lostCasts) {
      errorHandler(props.lostCasts)
      return
    }

    drawChart(props.lostCasts)
    const chartDiv = document.querySelector(".losts-wrapper") as HTMLDivElement
    chartDiv.style.opacity = "1"

    return () => am4core.disposeAllCharts()
  }, [props.lostCasts])

  return <div className="losts-wrapper">
    <div id="chartdiv-loss" className="z-depth-5"></div>
    <CastLostTable lostCasts={props.lostCasts} />
  </div>
}

export default connect(
  (state: ApplicationState) => state.lostCast,
  CastStore.actionCreators
)(CastLost as any);
