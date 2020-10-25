import * as React from 'react'


export default (props: { children?: React.ReactNode }) => {

  return <React.Fragment>
    <div className="empty-layout">
      {props.children}
    </div>
  </React.Fragment>
}