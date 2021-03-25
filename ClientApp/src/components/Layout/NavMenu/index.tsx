import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { ApplicationState } from '../../../store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { IdleSet } from "../../../models/types/gant";
import { LostCast } from "../../../models/types/lostCast";
import { CastLostNavHandler, GantNavHandler, INavMenuStateHandler } from './NavStateHandlers';
import * as CastStore from '../../../store/LostCastStore'
import * as GantStore from '../../../store/GantStore';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import MenuIcon from "@material-ui/icons/Menu"
import moment from 'moment'



export interface NavMenuProps {
  location: any,
  shops: string[]
  setIdles: (idleSet: IdleSet) => GantStore.KnownAction
  setLostCasts: (data: LostCast[]) => CastStore.KnownAction
  clearLostCasts: () => CastStore.KnownAction,
  clearIdles: () => GantStore.KnownAction
}


///////////////////////// NAV MENU CLASS
class NavMenu extends React.Component<NavMenuProps> {
  public stateHandler: INavMenuStateHandler | undefined
  private path = this.props.location.pathname.slice(1)
  private liEls: HTMLLIElement[] | undefined
  private sidenav: HTMLUListElement | undefined


  componentDidMount = () => {
    this.liEls = Array.from(document.getElementsByTagName("li"))
    this.sidenav = document.getElementById("mobile-demo") as HTMLUListElement
    this.stateHandler = this.getNavHandler(this.path)
  }

  componentDidUpdate = (prevProps: NavMenuProps) => {
    this.path = this.props.location.pathname.slice(1) || "brand-logo"

    this.liEls!.forEach(ul => ul.classList.remove("active"))
    document.getElementById(this.path)!.classList.add("active")
    document.getElementById(this.path + "S")!.classList.add("active")

    const prevPath = prevProps.location.pathname
    const thisPath = this.props.location.pathname

    if (prevPath !== thisPath && prevPath !== "/") {
      this.stateHandler!.dispose()
      this.stateHandler = this.getNavHandler(this.path)
    }
  }


  toggleMenu = () => this.sidenav!.classList.toggle("sidebar-visible")
  getNavHandler = (path: string): INavMenuStateHandler => {
    if (path === "gant" || path === "")
      return new GantNavHandler(this)

    return new CastLostNavHandler(this)
  }
  assembleShops = (shops: string[]) => shops.map(shop => <li key={shop} onClick={e => (this.stateHandler!.clickShop(e))}>{shop}</li>)


  ////////////////////////////// RENDER
  public render() {
    //console.log("nav-render", this.props.shops)

    const shops = this.path === "gant"
      ? this.props.shops.length > 0
        ? this.assembleShops(this.props.shops)
        : <></>
      : this.assembleShops(["МНЛЗ-2", "МНЛЗ-5"])

    return (
      <>
        <header className="navbar-fixed">
          <nav>
            <div className="nav-wrapper z-depth-5">
              <div className="menu" onClick={_ => this.toggleMenu()} ><MenuIcon className="menu-icon" /></div>
              <li className="left hide-first logo"><img src="logo1.png" onClick={_ => document.location.href = "https://mechel.com"} ></img>ПРОСТОИ И ПОТЕРИ ПАО ЧМК</li>
              <ul className="hide-third">
                <li id="gant" className="active"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
                <li id="castlost"><Link to="/castlost">ПОТЕРИ СТАЛИ</Link></li>
                <li className="hide-first" style={{ width: '100px' }}>&nbsp;</li>
                <li className="input-field">
                  <input type="text" className="datepicker" id="bDate" />
                  <label htmlFor="bDate">НАЧАЛО</label>
                </li>
                <li className="input-field">
                  <input type="text" className="datepicker" id="eDate" />
                  <label htmlFor="eDate">ОКОНЧАНИЕ</label>
                </li>
                <li>
                  <a className="dropdown-trigger" href="#!" data-target="dropdown1">ЦЕХ<ArrowDownIcon className="menu-icon" /></a>
                  <ul id="dropdown1" className="dropdown-content z-depth-5">{shops}</ul>
                </li>
                <li className="right hide-third" style={{ fontSize: "smaller" }}>{moment().format("DD.MM.YYYY  HH:mm")}</li>
                <li className="brand-logo">{this.stateHandler && this.stateHandler.currentShop}</li>
              </ul>
            </div>
            <div id="loading" className="loading"><img src="loading4.gif" height="50px" width="62px" alt="Loading.." /></div>
          </nav>
        </header >

        <ul className="sidebar" id="mobile-demo">
          <li style={{ borderBottom: "1px solid darkgrey", fontWeight: "bold" }}><a>{this.stateHandler && this.stateHandler.currentShop}</a></li>
          <li id="gantS" className="waves-effect"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
          <li id="castlostS" className="waves-effect"><Link to="/castlost">ПОТЕРИ СТАЛИ</Link></li>
          <li style={{ fontSize: "smaller", borderTop: "1px solid darkgrey" }}><a>{moment().format("DD.MM.YYYY  HH:mm")}</a></li>
        </ul >
      </>
    );
  }
}


const mapDispatchToProps = (dispatch: any) => bindActionCreators({ ...GantStore.actionCreators, ...CastStore.actionCreators }, dispatch)

const showTheLocationWithRouter = withRouter(NavMenu as any)

export default connect(
  (state: ApplicationState) => ({ ...state.gant, ...state.lostCast }),
  mapDispatchToProps
)(showTheLocationWithRouter)

