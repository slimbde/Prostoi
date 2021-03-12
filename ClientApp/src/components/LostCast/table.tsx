import { LostCast } from "../../models/types/lostCast"
import * as React from 'react'
import moment from 'moment'


type CastLostTableProps = {
  lostCasts: LostCast[]
}


export const CastLostTable: React.FC<CastLostTableProps> = (props: CastLostTableProps) => {
  const data = props.lostCasts
    ? props.lostCasts.map(lc => <tr key={lc.date + lc.lostIdle}>
      <td style={{ background: "#cececd" }}>{lc.lostIdle.toLocaleString()}</td>
      <td style={{ background: "#eee9db" }}>{lc.lostEfficiency.toLocaleString()}</td>
      <td className="main-field">{moment(lc.date).format("DD.MM.YYYY")}</td>
    </tr>)
    : <tr><td></td><td></td><td></td></tr>
  let totalIdle = 0
  let totalEfficiency = 0
  props.lostCasts && props.lostCasts.forEach((lc: LostCast) => {
    totalIdle += lc.lostIdle
    totalEfficiency += lc.lostEfficiency
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