import "./stats.scss"
import React, { useEffect, useState } from 'react';
import StatsSidePanel from "./statsSidePanel";
import { StatsTable } from "./statsTable";
import { useStateSelector } from "store-toolkit/hooks";
import { useLazyGetUsageForQuery } from "store-toolkit/api.stats";





export default () => {
  const { currentIp: ip, bDate, eDate } = useStateSelector(appState => appState.stats)
  const [getData, { requestId, isFetching, error, data: usages }] = useLazyGetUsageForQuery()
  const [rid, setRid] = useState<string | undefined>("")

  useEffect(() => {
    if (!ip) return
    getData({ bDate, eDate, ip }, true)
  }, [ip, bDate, eDate])


  useEffect(() => {
    if (!error) return

    if (requestId !== rid)
      M.toast({ html: (error as any).data.includes("no element") ? `${ip}: нет данных` : (error as any).data })

    setRid(requestId)
    //eslint-disable-next-line  
  }, [error])


  useEffect(() => {
    const loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl && (loadingEl.style.opacity = isFetching ? "1" : "0")
    //eslint-disable-next-line  
  }, [isFetching])

  return <>
    <StatsSidePanel />
    {usages && usages.length > 0 && <StatsTable usages={usages} />}
  </>
}
