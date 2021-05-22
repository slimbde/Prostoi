import React from "react"
import { Usage } from "../../models/types/stats"
import moment from "moment"
import "./stats-styles.css"


type StatsTableProps = {
  usages: Usage[]
}


export const StatsTable: React.FC<StatsTableProps> = (props: StatsTableProps) => {
  const predicate = (a: Usage, b: Usage) => {
    return a.date < b.date
      ? -1
      : a.date > b.date
        ? 1 : 0
  }

  const data = props.usages.concat().sort(predicate).map(item =>
    <tr key={`${item.ip}${item.date}`}>
      <td>{item.ip}</td>
      <td>{moment(item.date).format("DD.MM.YYYY  HH:mm")}</td>
      <td>{methodDecoder[item.method]}</td>
      <td>{paramDecoder(item.params)}</td>
    </tr>
  )

  const uniqueIps = [...new Set(props.usages.map(item => item.ip))].length
  const uniqueMethods = [...new Set(props.usages.map(item => item.method))].length

  return (
    <table className="highlight">
      <thead>
        <tr>
          <th>Кто<span className="badge">{uniqueIps}</span></th>
          <th>Когда</th>
          <th>Куда<span className="badge">{uniqueMethods}</span></th>
          <th>Зачем</th>
        </tr>
      </thead>
      <tbody>
        {data}
      </tbody>
    </table >
  )
}




const methodDecoder: { [key: string]: string } = {
  "/api/Idle/GetIdles": "Простои Гант",
  "/api/Idle/GetMNLZ2LostIdles": "Потери МНЛЗ-2",
  "/api/Idle/GetMNLZ5LostIdles": "Потери МНЛЗ-5",
}

const paramDecoder = (param: string) => {
  return param.replace("bDate=", "c: ")
    .replace("&eDate=", ", по: ")
    .replace("&ceh=", ", цех: ")
}