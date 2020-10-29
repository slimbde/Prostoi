import * as React from 'react'
import { LostIdle } from '../../store/CastLost'
import moment from 'moment'


type CastLostTableProps = {
  castLosts: LostIdle[]
}


export const CastLostTable: React.FC<CastLostTableProps> = (props: CastLostTableProps) => {
  const data = props.castLosts
    ? props.castLosts.map(cl => <tr key={cl.date + cl.lostMetal}>
      <td>{cl.lostMetal}</td>
      <td className="main-field">{moment(cl.date).format("DD.MM.YYYY")}</td>
    </tr>)
    : <tr><td></td><td></td></tr>

  return (
    <table className="highlight centered z-depth-5">
      <thead>
        <tr>
          <th className="table-header">Простои, т</th>
          <th className="table-header">&nbsp;</th>
        </tr>
      </thead>
      <tbody>{data}</tbody>
    </table>
  )
}