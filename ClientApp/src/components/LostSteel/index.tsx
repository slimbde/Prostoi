import * as React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import { drawChart } from './drawChart'
import LostSteelSidePanel from "./LostSteelSidePanel";
import { LostSteelTable } from './LostSteelTable';
import '../Layout/sidepanel.scss'
import './lostSteel.scss'
import { useStateSelector } from "store-toolkit/hooks";
import { useLazyGetCcmLostSteelQuery } from "store-toolkit/api.idle";






export default () => {
  const { currentShop: ceh, bDate, eDate } = useStateSelector(root => root.lostSteel)
  const [getLostSteel, { requestId, error, isFetching, data }] = useLazyGetCcmLostSteelQuery()
  const [rid, setRid] = React.useState<string | undefined>("")

  React.useEffect(() => {
    if (!ceh) return
    getLostSteel({ bDate, eDate, ccmNo: +ceh.split("-")[1] }, true)
  }, [ceh, bDate, eDate])

  React.useEffect(() => {
    if (!data) return
    drawChart(data)
    return () => am4core.disposeAllCharts()
  }, [data])

  React.useEffect(() => {
    if (!error) return
    if (requestId !== rid)
      M.toast({ html: (error as any).data.includes("no element") ? `${ceh}: нет данных` : (error as any).data })

    setRid(requestId)
    //eslint-disable-next-line  
  }, [error])

  React.useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl && (loadingEl.style.opacity = isFetching ? "1" : "0")
    //eslint-disable-next-line  
  }, [isFetching])





  return <>
    <LostSteelSidePanel />
    <div className="losts-wrapper">
      <div id="chartdiv"></div>
      {data && <LostSteelTable lostSteel={data} />}
    </div>
  </>
}

