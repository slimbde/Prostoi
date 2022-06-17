import * as React from 'react';
import { NavLink as Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import MenuIcon from "@material-ui/icons/Menu"
import moment from 'moment'
import { NavItem } from "reactstrap";



export interface NavMenuProps {
  location: any
}


///////////////////////// NAV MENU CLASS
class NavMenu extends React.Component<NavMenuProps> {


  toggleMenu = () => {
    document.getElementsByClassName("sidepanel")[0]!.classList.toggle("hidden")
    document.getElementsByClassName("loading")[0]!.classList.toggle("loading-full")
  }


  ////////////////////////////// RENDER
  public render() {
    //console.log("nav-render", this.props.shops)

    return (
      <>
        <header className="navbar-fixed">
          <nav>
            <div className="nav-wrapper">
              <div className="menu" onClick={this.toggleMenu} ><MenuIcon className="menu-icon" /></div>
              <li className="left hide-second logo"><img src="logo1.png" onClick={_ => document.location.href = "https://mechel.com"} ></img>ПРОСТОИ И ПОТЕРИ ПАО ЧМК</li>
              <ul className="hide-third">
                <NavItem><Link to="/gant">ПРОСТОИ</Link></NavItem>
                <NavItem><Link to="/lost-steel">ПОТЕРИ</Link></NavItem>
                <NavItem><Link to="/stats">СТАТИСТИКА ПОСЕЩЕНИЙ</Link></NavItem>
                <li className="hide-first" style={{ width: '100px' }}>&nbsp;</li>
                <li className="right hide-third" style={{ fontSize: "smaller" }}>{moment().format("DD.MM.YYYY  HH:mm")}</li>
                <li className="brand-logo"></li>
              </ul>
            </div>
            <img id="loading" className="loading" src="loading4.gif" />
          </nav>
        </header >
      </>
    );
  }
}


const showTheLocationWithRouter = withRouter(NavMenu as any)
export default connect()(showTheLocationWithRouter)
