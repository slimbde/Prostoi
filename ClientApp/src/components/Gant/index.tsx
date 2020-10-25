import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { drawChart } from './drawChart';
import * as GantStore from '../../store/Gant';
import * as am4core from "@amcharts/amcharts4/core";



type GantProps = {
  idles: GantStore.IdleSet
}



class Gant extends Component<GantProps> {

  componentDidUpdate(prevProps: GantProps, prevState: ApplicationState) {
    if (prevProps.idles !== this.props.idles && !!this.props.idles) {
      am4core.disposeAllCharts()
      drawChart(this.props.idles)

      setTimeout(() => {
        const loading = document.getElementById("loading") as HTMLElement
        loading.style.opacity = "0"
      }, 500)
    }
  }

  componentWillUnmount = () => am4core.disposeAllCharts()

  render() {
    //console.log(this.props)

    return <div id="chartdiv"></div>
  }
};

export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(Gant as any);
