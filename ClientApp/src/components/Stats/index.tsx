import React, { useEffect } from 'react';
import ReactDOM from "react-dom";
import { connect } from 'react-redux';
import { dbProxy } from "../../models/handlers/DbProxy";
import { Usage } from "../../models/types/stats";
import { ApplicationState } from '../../store';
import * as StatsStore from '../../store/StatsStore';
import { StatsSidePanel } from "./statsSidePanel";
import { StatsTable } from "./statsTable";



type StatsProps = {
  usages: Usage[]
  setUsages: (usageList: Usage[]) => StatsStore.KnownAction
}



const Stats: React.FC<StatsProps> = (props: StatsProps) => {
  useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl.style.display = "none"

    dbProxy.getUsageIpsAsync()
      .then(data => {
        const sidepanel = document.getElementById("sidepanel") as HTMLDivElement
        data.length > 0 && ReactDOM.render(<StatsSidePanel ips={data} setUsages={props.setUsages} />, sidepanel)
      })
      .catch(data => {
        dbProxy.remove("getUsageIpsAsync")
        console.error(data)
      })
  }, [])


  useEffect(() => {
    if (!props.usages || !(props.usages.length > 0))
      return

  }, [props.usages])

  return <div className="stats-wrapper">
    {props.usages.length > 0 && <StatsTable usages={props.usages} />}
  </div>
};

export default connect(
  (state: ApplicationState) => state.stats,
  StatsStore.actionCreators
)(Stats as any);
