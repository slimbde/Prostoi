import * as React from 'react';
import NavMenu from './NavMenu'
import Footer from './Footer'
import './styles.css'


type NavMenuProps = {
  children?: React.ReactNode,
}


export default (props: NavMenuProps) => {

  return <React.Fragment>
    <NavMenu {...props} />
    <div className="container">
      {props.children}
      <div className="push"></div>
      <Footer />
    </div>
  </React.Fragment>
}
