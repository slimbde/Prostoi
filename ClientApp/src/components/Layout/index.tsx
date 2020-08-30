import * as React from 'react';
import NavMenu from './NavMenu';
import M from 'materialize-css/dist/js/materialize.js'
import './styles.css'

export default (props: { children?: React.ReactNode, logout: any }) => {
  React.useEffect(() => { M.toast({ html: "Вы успешно вошли в систему" }) }, [])

  return <React.Fragment>
    <NavMenu logout={props.logout} />
    <div className="container">
      {props.children}
    </div>
  </React.Fragment>
}
