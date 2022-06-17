import * as React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import * as CastStore from '../../store/LostSteelStore';
import { drawChart } from './drawChart'
import { connect } from 'react-redux'
import LostCastSidePanel from "./LostSteelSidePanel";
import { ApplicationState } from '../../store';
import { LostSteelTable } from './LostSteelTable';
import '../Layout/sidepanel.scss'
import './lostSteel.scss'


type Props = CastStore.LostState

const Steel: React.FC<Props> = ({
  lostSteel,
}) => {

  React.useEffect(() => {
    if (!lostSteel || lostSteel.length === 0) return

    drawChart(lostSteel)

    return () => am4core.disposeAllCharts()
  }, [lostSteel])


  return <>
    <LostCastSidePanel />
    <div className="losts-wrapper">
      <div id="chartdiv"></div>
      {lostSteel && <LostSteelTable lostSteel={lostSteel} />}
    </div>
  </>
}

export default connect(
  (state: ApplicationState) => state.lostSteel,
  CastStore.actionCreators
)(Steel as any);
