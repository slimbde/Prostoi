import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store';
import * as GantStore from '../../../store/Gant';
import * as CastStore from '../../../store/LostCast'
import MenuIcon from "@material-ui/icons/Menu"
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import moment from 'moment'
import { CastLostNavHandler, GantNavHandler, INavMenuStateHandler } from './stateHandlers';
import { bindActionCreators } from 'redux';


export interface NavMenuProps {
  location: any,
  shops: string[]
  setIdles: (idleSet: GantStore.IdleSet) => void
  setLostCasts: (data: CastStore.LostCast[]) => void
  clearLostCasts: () => void,
  clearIdles: () => void
}

export interface NavMenuState {
  firstLoad: boolean
  currentShop: string
}



class NavMenu extends React.Component<NavMenuProps, NavMenuState> {
  public stateHandler: INavMenuStateHandler


  constructor(props: NavMenuProps) {
    super(props)

    const path = props.location.pathname.slice(1)

    this.stateHandler = path === "gant" || path === ""
      ? new GantNavHandler(this)
      : new CastLostNavHandler(this)
  }


  state: NavMenuState = {
    firstLoad: true,
    currentShop: "",
  }


  componentDidMount = () => this.stateHandler.didMount()

  componentDidUpdate = (prevProps: NavMenuProps) => this.stateHandler.didUpdate(prevProps)

  componentWillUnmount = () => this.stateHandler.willUnmount()




  ////////////////////////////// RENDER
  public render() {
    //console.log("nav-render", this.props)

    const previousActive = document.querySelectorAll("ul > li.active")!
    previousActive.forEach(p => p.classList.remove("active"))

    const path = this.props.location.pathname.slice(1) || "brand-logo"

    const li = document.getElementById(path)!
    const liS = document.getElementById(path + "S")!
    li && li.classList.add("active")
    liS && liS.classList.add("active")

    const shops = Array.isArray(this.props.shops) && path === "gant"
      ? this.props.shops.map(shop => <li key={shop} onClick={e => this.stateHandler.clickShop(e)}>{shop}</li>)
      : ["МНЛЗ-2", "МНЛЗ-5"].map(shop => <li key={shop} onClick={e => this.stateHandler.clickShop(e)}>{shop}</li>)

    return (
      <header className="navbar-fixed">
        <nav>
          <div className="nav-wrapper z-depth-5">
            <div className="right" style={{ fontSize: "smaller" }}>{moment().format("DD.MM.YYYY  HH:mm")}</div>
            <Link to="#" data-target="mobile-demo" className="sidenav-trigger"><MenuIcon className="menu-icon" /></Link>
            <ul className="hide-on-med-and-down">
              <li id="gant" className="active"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
              <li id="castlost"><Link to="/castlost">ПОТЕРИ СТАЛИ</Link></li>
              <li style={{ width: '100px' }}>&nbsp;</li>
              <form autoComplete="off">
                <li className="input-field">
                  <input type="text" className="datepicker" id="bDate" />
                  <label htmlFor="bDate">Дата начала</label>
                </li>
                <li className="input-field">
                  <input type="text" className="datepicker" id="eDate" />
                  <label htmlFor="eDate">Дата окончания</label>
                </li>
                <ul className="hide-on-small-and-down">
                  <li>
                    <a className="dropdown-trigger" href="#!" data-target="dropdown1">ЦЕХ<ArrowDownIcon className="menu-icon" /></a>
                    <ul id="dropdown1" className="dropdown-content z-depth-5">{shops}</ul>
                  </li>
                </ul>
              </form>
            </ul>
            <div className="brand-logo">{this.state.currentShop}</div>
          </div>
          <div id="loading" className="loading"><img src="loading4.gif" height="50px" width="62px" alt="Loading.." /></div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
          <li id="gantS" className="waves-effect"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
          <li id="castlostS" className="waves-effect"><Link to="/castlost">ПОТЕРИ СТАЛИ</Link></li>
        </ul>
      </header>
    );
  }
}


const mapDispatchToProps = (dispatch: any) => bindActionCreators({ ...GantStore.actionCreators, ...CastStore.actionCreators }, dispatch)

const showTheLocationWithRouter = withRouter(NavMenu as any)
export default connect(
  (state: ApplicationState) => ({ ...state.gant, ...state.lostCast }),
  mapDispatchToProps
)(showTheLocationWithRouter)

