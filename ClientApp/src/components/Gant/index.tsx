import "../Layout/sidepanel.scss"
import * as GantStore from '../../store/GantStore';
import * as am4core from "@amcharts/amcharts4/core";
import React, { useEffect } from 'react';
import GantSidePanel from "./gantSidePanel";
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { drawChart } from './drawChart';



type Props = GantStore.GantState



const Gant: React.FC<Props> = ({
  idles,
}) => {

  useEffect(() => {
    if (!idles) return
    drawChart(idles)

    return () => am4core.disposeAllCharts()
  }, [idles])

  return <>
    <GantSidePanel />
    <div id="chartdiv"></div>
  </>
};

export default connect(
  (state: ApplicationState) => ({ ...state.gant }),
  null
)(Gant as any);
