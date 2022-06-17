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
      <tr key={`${item.ip}${item.date}${item.method}${item.params}`}>
        <td>{item.ip}</td>
        <td>{moment(item.date).format("DD.MM.YYYY  HH:mm")}</td>
        <td>{methodDecoder[item.method]}</td>
        <td>{paramDecoder(item.params)}</td>
      </tr>
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
    <table className="highlight stats-table">
      <thead>
        <tr>
          <th className="a-like" onClick={() => headerClick("ip")}>Кто{state.field === "ip" && state.arrow}<span className="badge">{uniqueIps}</span></th>
          <th className="a-like" onClick={() => headerClick("date")}>Когда{state.field === "date" && state.arrow}</th>
          <th className="a-like" onClick={() => headerClick("method")}>Куда{state.field === "method" && state.arrow}<span className="badge">{uniqueMethods}</span></th>
          <th>Зачем</th>
        </tr>
      </thead>
      <tbody>
        {state.data}
      </tbody>
    </table >
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
