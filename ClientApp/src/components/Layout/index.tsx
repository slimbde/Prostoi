import * as React from 'react';
import NavMenu from './NavMenu'
import Footer from './Footer'
import './layout.scss'


type NavMenuProps = {
  children?: React.ReactNode,
}


export default (props: NavMenuProps) => {

  return <>
    <NavMenu {...props} />
    <div className="main">
      {props.children}
    </div>
    <Footer />
  </>
}
