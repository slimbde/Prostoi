import * as React from 'react';
import NavMenu from './NavMenu';
import './styles.css'


export default (props: { children?: React.ReactNode, logout: any, userName: string }) => {
  //React.useEffect(() => { M.toast({ html: "Вы успешно вошли в систему" }) }, [])

  // to pass on props one should merge them with the rest props of a component
  // using spread operator for instance
  const navProps = {
    logout: props.logout,
    userName: props.userName
  }

  return <React.Fragment>
    {<NavMenu {...navProps} />}
    <div className="container">
      {props.children}
    </div>
  </React.Fragment>
}
