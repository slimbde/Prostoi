import moment from 'moment'
import * as React from 'react'
import { LostSteel } from "models/types/lostSteel"


type Props = {
  lostSteel: LostSteel[]
}


export const LostSteelTable: React.FC<Props> = ({
  lostSteel,
}) => {

  const data = lostSteel
    ? lostSteel.map((ls, idx) => <tr key={idx}>
      <td style={{ background: "#cececd" }}>{ls.IDLE_WEIGHT.toLocaleString()}</td>
      <td style={{ background: "#eee9db" }}>{ls.DOWNTIME_WEIGHT.toLocaleString()}</td>
      <td className="main-field">{moment(ls.SHIFT).format("DD.MM.YYYY")}</td>
    </tr>)
    : <tr><td></td><td></td><td></td></tr>

  let totalIdle = 0
  let totalEfficiency = 0

  lostSteel && lostSteel.forEach((lc: LostSteel) => {
    totalIdle += lc.IDLE_WEIGHT
    totalEfficiency += lc.DOWNTIME_WEIGHT
  })

  return (
    <table className="highlight centered z-depth-5">
      <thead>
        <tr><th className="table-header" colSpan={3}>ПОТЕРИ, т.</th></tr>
        <tr>
          <th className="table-header">Простои</th>
          <th className="table-header">Произв-ть</th>
          <th className="table-header">Дата</th>
        </tr>
      </thead>
      <tbody>
        {data}
        <tr>
          <td style={{ background: "#bbbbbb", fontWeight: 600 }}>{totalIdle.toLocaleString()}</td>
          <td style={{ background: "#dbd7ca", fontWeight: 600 }}>{totalEfficiency.toLocaleString()}</td>
          <td style={{ background: "#3b688c7e", fontWeight: 600 }}>ИТОГО</td>
        </tr>
      </tbody>
    </table >
  )
}