import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { ApplicationState } from '../../store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import MenuIcon from "@material-ui/icons/Menu"
import moment from 'moment'



export interface NavMenuProps {
  location: any
}


///////////////////////// NAV MENU CLASS
class NavMenu extends React.Component<NavMenuProps> {
  public dropDownHint: string | undefined
  private path = this.props.location.pathname.slice(1)
  private liEls: HTMLLIElement[] | undefined
  private sidenav: HTMLDivElement | undefined
  private chartfield: HTMLDivElement | undefined
  private loading: HTMLDivElement | undefined


  componentDidMount = () => {
    this.liEls = Array.from(document.getElementsByTagName("li"))
    this.sidenav = document.getElementById("sidepanel") as HTMLDivElement
    this.chartfield = document.getElementById("chartfield") as HTMLDivElement
    this.loading = document.getElementsByClassName("loading")[0] as HTMLDivElement

    this.componentDidUpdate(this.props)
  }

  componentDidUpdate = (prevProps: NavMenuProps) => {
    this.path = this.props.location.pathname.slice(1) || "brand-logo"

    this.liEls!.forEach(ul => ul.classList.remove("active"))

    const navLink = document.getElementById(this.path)
    navLink && navLink.classList.add("active")

    const navLinkS = document.getElementById(this.path + "S")
    navLinkS && navLinkS.classList.add("active")
  }


  toggleMenu = () => {
    this.sidenav!.classList.toggle("sidepanel-hidden")
    this.chartfield!.classList.toggle("chartfield-full")
    this.loading!.classList.toggle("loading-full")
  }


  ////////////////////////////// RENDER
  public render() {
    //console.log("nav-render", this.props.shops)

    return (
      <>
        <header className="navbar-fixed">
          <nav>
            <div className="nav-wrapper">
              <div className="menu" onClick={_ => this.toggleMenu()} ><MenuIcon className="menu-icon" /></div>
              <li className="left hide-second logo"><img src="logo1.png" onClick={_ => document.location.href = "https://mechel.com"} ></img>ПРОСТОИ И ПОТЕРИ ПАО ЧМК</li>
              <ul className="hide-third">
                <li id="gant" className="active"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
                <li id="castlost"><Link to="/castlost">ПОТЕРИ СТАЛИ</Link></li>
                <li id="stats"><Link to="/stats">СТАТИСТИКА</Link></li>
                <li className="hide-first" style={{ width: '100px' }}>&nbsp;</li>
                <li className="right hide-third" style={{ fontSize: "smaller" }}>{moment().format("DD.MM.YYYY  HH:mm")}</li>
                <li className="brand-logo"></li>
              </ul>
            </div>
            <div id="loading" className="loading"><img src="loading4.gif" height="50px" width="62px" alt="Loading.." /></div>
          </nav>
        </header >
      </>
    );
  }
}


const showTheLocationWithRouter = withRouter(NavMenu as any)
export default connect()(showTheLocationWithRouter)
