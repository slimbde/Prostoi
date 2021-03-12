import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { drawChart } from './drawChart';
import * as GantStore from '../../store/GantStore';
import * as am4core from "@amcharts/amcharts4/core";



type GantProps = {
  idles: GantStore.IdleSet
}



const Gant: React.FC<GantProps> = (props: GantProps) => {
  useEffect(() => {
    if (!props.idles)
      return

    //if ("error" in props.idles) {
    //errorHandler(props.idles)
    //  return
    //}

    drawChart(props.idles)

    return () => am4core.disposeAllCharts()
  }, [props.idles])

  return <div id="chartdiv"></div>
};

export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(Gant as any);
