import "./stats.scss"
import React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as StatsStore from '../../store/StatsStore';
import StatsSidePanel from "./statsSidePanel";
import { StatsTable } from "./statsTable";



type Props = StatsStore.StatsState & typeof StatsStore.actionCreators



const Stats: React.FC<Props> = ({
  usages,
}) => {


  return <>
    <StatsSidePanel />
    {usages && usages.length > 0 && <StatsTable usages={usages} />}
  </>
};

export default connect(
  (state: ApplicationState) => state.stats,
  StatsStore.actionCreators
)(Stats as any);
