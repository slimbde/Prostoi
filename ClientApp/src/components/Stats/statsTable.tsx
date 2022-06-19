import React, { useEffect, useState } from "react"
import { Usage } from "../../models/types/stats"
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowUpIcon from '@material-ui/icons/ArrowDropUp'
import moment from "moment"


type StatsTableProps = {
  usages: Usage[]
}



export const StatsTable: React.FC<StatsTableProps> = (props: StatsTableProps) => {

  const countData = (field: string, asc: boolean): JSX.Element[] =>
    props.usages.concat().sort(predicateProvider(field, asc)).map(item =>
      <div className="tr" key={`${item.ip}${item.date}${item.method}${item.params}`}>
        <div className="td">{item.ip}</div>
        <div className="td">{moment(item.date).format("DD.MM.YYYY  HH:mm")}</div>
        <div className="td">{methodDecoder[item.method]}</div>
        <div className="td">{paramDecoder(item.params)}</div>
      </div>
    )

  const [state, setState] = useState({
    field: "date",
    asc: true,
    arrow: <ArrowDownIcon className="menu-icon" />,
    data: countData("date", true)
  })

  useEffect(() => {
    setState({ ...state, data: countData(state.field, state.asc) })
  }, [props.usages])


  const uniqueIps = [...new Set(props.usages.map(item => item.ip))].length
  const uniqueMethods = [...new Set(props.usages.map(item => item.method))].length


  const headerClick = (field: string) => {
    const asc = field === state.field ? !state.asc : state.asc
    const data = countData(field, asc)
    const arrow = asc
      ? <ArrowDownIcon className="menu-icon" />
      : <ArrowUpIcon className="menu-icon" />

    setState({ field, data, arrow, asc })
  }


  return (
    <div className="stats-table">
      <div className="thead">
        <div className="tr">
          <div className="th a-like" onClick={() => headerClick("ip")}>{state.field === "ip" && state.arrow}Кто<span className="badge">{uniqueIps}</span></div>
          <div className="th a-like" onClick={() => headerClick("date")}>{state.field === "date" && state.arrow}Когда</div>
          <div className="th a-like" onClick={() => headerClick("method")}>{state.field === "method" && state.arrow}Куда<span className="badge">{uniqueMethods}</span></div>
          <div className="th">Зачем</div>
        </div>
      </div>
      <div className="tbody">
        {state.data}
      </div>
    </div >
  )
}




const methodDecoder: { [key: string]: string } = {
  "/api/Idle/GetIdles": "Простои Гант",
  "/api/Idle/GetMNLZ2LostIdles": "Потери МНЛЗ-2",
  "/api/Idle/GetMNLZ5LostIdles": "Потери МНЛЗ-5",
  "/api/usage/GetUsageFor": "Статистика",
}

const paramDecoder = (param: string) => {
  return param.replace("bDate=", "c: ")
    .replace("&eDate=", ", по: ")
    .replace("&ceh=", ", цех: ")
    .replace("&ip=", ", ip: ")
}

const predicateProvider = (field: string, asc: boolean) => {
  return (a: Usage, b: Usage) =>
    a[field] > b[field]
      ? asc ? - 1 : 1
      : a[field] < b[field]
        ? asc ? 1 : -1
        : 0
}
