import * as React from 'react'
import { LostIdle } from '../../store/CastLost'
import moment from 'moment'


type CastLostTableProps = {
  castLosts: LostIdle[]
}


export const CastLostTable: React.FC<CastLostTableProps> = (props: CastLostTableProps) => {
  const data = props.castLosts
    ? props.castLosts.map(cl => <tr key={cl.date + cl.lostMetal}>
      <td>{cl.lostMetal.toLocaleString()}</td>
      <td className="main-field">{moment(cl.date).format("DD.MM.YYYY")}</td>
    </tr>)
    : <tr><td></td><td></td></tr>
  let total = 0
  props.castLosts && props.castLosts.forEach((li: LostIdle) => total += li.lostMetal)

  return (
    <table className="highlight centered z-depth-5">
      <thead>
        <tr><th className="table-header" colSpan={2}>ПОТЕРИ, т.</th></tr>
        <tr>
          <th className="table-header">По простоям</th>
          <th className="table-header">Дата</th>
        </tr>
      </thead>
      <tbody>
        {data}
        <tr><td className="outcome">{total.toLocaleString()}</td><td className="outcome">ИТОГО</td></tr>
      </tbody>
    </table >
  )
}