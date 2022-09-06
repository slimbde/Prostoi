import "../Layout/sidepanel.scss"
import * as am4core from "@amcharts/amcharts4/core";
import React, { useEffect, useState } from 'react';
import GantSidePanel from "./gantSidePanel";
import { drawChart } from './drawChart';
import { useStateSelector } from "store-toolkit/hooks";
import { useLazyGetGantIdlesQuery } from "store-toolkit/api.idle";





export default () => {
  const { currentShop: ceh, bDate, eDate } = useStateSelector(root => root.gant)
  const [getIdles, { requestId, error, isFetching, data }] = useLazyGetGantIdlesQuery()
  const [rid, setRid] = useState<string | undefined>("")

  useEffect(() => {
    if (!ceh) return
    getIdles({ bDate, eDate, ceh }, true)
  }, [ceh, bDate, eDate])

  useEffect(() => {
    if (!data) return
    drawChart(data)
    return () => am4core.disposeAllCharts()
  }, [data])

  useEffect(() => {
    if (!error) return

    if (requestId !== rid)
      M.toast({ html: (error as any).data.includes("no element") ? `${ceh}: нет простоев` : (error as any).data })

    setRid(requestId)
    //eslint-disable-next-line  
  }, [error])


  useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl && (loadingEl.style.opacity = isFetching ? "1" : "0")
    //eslint-disable-next-line  
  }, [isFetching])


  return <>
    <GantSidePanel />
    <div id="chartdiv"></div>
  </>
}

