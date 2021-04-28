import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Usage } from "../../models/types/stats";
import { ApplicationState } from '../../store';
import * as StatsStore from '../../store/StatsStore';



type StatsProps = {
  usages: Usage[]
}



const Stats: React.FC<StatsProps> = (props: StatsProps) => {
  useEffect(() => {
    if (!props.usages || !(props.usages.length > 0))
      return

    //drawChart(props.idles)

    //return () => am4core.disposeAllCharts()
  }, [props.usages])

  return <div id="stats-wrapper"></div>
};

export default connect(
  (state: ApplicationState) => state.stats,
  StatsStore.actionCreators
)(Stats as any);
