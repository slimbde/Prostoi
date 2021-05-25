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
      <div className="main">
        <div id="sidepanel"></div>
        <div id="chartfield">
          {props.children}
        </div>
      </div>
    </div>
    <Footer />
  </React.Fragment>
}
