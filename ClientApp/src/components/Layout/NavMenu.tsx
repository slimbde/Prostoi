import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { ApplicationState } from '../../store';
import * as GantStore from '../../store/Gant';
import MenuIcon from "@material-ui/icons/Menu"
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import moment from 'moment'
import M from 'materialize-css/dist/js/materialize.js'


interface NavMenuProps {
  location: any,
  shops: string[]
  setIdles: (idleSet: GantStore.IdleSet) => void
}


class NavMenu extends React.PureComponent<NavMenuProps> {
  private sideNav: any;
  private profileMenu: any
  private datePickers: any
  private bDate: any
  private eDate: any
  private loading: any


  state = {
    currentShop: "",
    bDate: "",
    eDate: "",
  }

  datepickerOptions = {
    format: "dd.mm.yyyy",
    defaultDate: new Date(),
    setDefaultDate: true,
    firstDay: 1,
    autoClose: true,
    onClose: () => this.datePick(),
    i18n: {
      months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
      weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      weekdaysAbbrev: ["В", "Пн", "В", "С", "Ч", "Пт", "С"]
    }
  }

  componentDidMount() {
    this.sideNav = M.Sidenav.init(document.getElementById("mobile-demo"))
    this.profileMenu = M.Dropdown.init(document.querySelector(".dropdown-trigger"))

    this.datePickers = M.Datepicker.init(document.querySelectorAll(".datepicker"), this.datepickerOptions)
    document.querySelectorAll(".nav-wrapper ul li").forEach(li => {
      !li.classList.contains("waves-effect") && li.classList.add("waves-effect")
    })

    this.bDate = this.bDate || React.createRef()
    this.eDate = this.eDate || React.createRef()

    this.loading = document.getElementById("loading") as HTMLElement
  }

  componentDidUpdate(prevProps: NavMenuProps, prevState: {}) {
    const prevPath = prevProps.location.pathname
    const thisPath = this.props.location.pathname

    if (prevPath !== thisPath && thisPath.slice(1) === "gant") {
      this.componentWillUnmount()
      this.componentDidMount()
      this.setState({ currentShop: "" })
    }
  }


  componentWillUnmount() {
    this.sideNav && this.sideNav.destroy()
    this.profileMenu && this.profileMenu.destroy()
    this.datePickers.forEach((dp: any) => dp.destroy)
  }

  //////////////////////////////////////////////////////////////////////// SHOP CLICK
  private clickShop(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    const selectedShop = (e.target as HTMLElement).textContent!

    if (selectedShop !== this.state.currentShop) {
      const bDate = moment((this.bDate.current as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
      const eDate = moment((this.eDate.current as HTMLInputElement).value, "DD.MM.YY").format("YYYY-MM-DD")

      setTimeout(() => {
        this.loading.style.opacity = "1"
        fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${selectedShop}`)
          .then(resp => resp.json() as Promise<GantStore.IdleSet>)
          .then(data => this.props.setIdles(data))
      }, 300)

      this.setState({ currentShop: selectedShop, bDate: bDate, eDate: eDate })
    }
  }

  //////////////////////////// DATE PICK
  private datePick() {
    const bDate = moment((this.bDate.current as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((this.eDate.current as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const selectedShop = this.state.currentShop

    if (bDate <= eDate && this.state.currentShop !== "")
      setTimeout(() => {
        this.loading.style.opacity = "1"
        fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${selectedShop}`)
          .then(resp => resp.json() as Promise<GantStore.IdleSet>)
          .then(data => this.props.setIdles(data))
        //.then(() => this.setState({ bDate: bDate, eDate: eDate }))
      }, 300)
  }



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
    return (
      <header className="navbar-fixed">
        <nav>
          <div className="nav-wrapper z-depth-5">
            <div className="right">{moment().format("DD.MM.YYYY  HH:mm")}</div>
            <Link to="#" data-target="mobile-demo" className="sidenav-trigger"><MenuIcon className="menu-icon" /></Link>
            <ul className="hide-on-med-and-down">
              <li id="gant" className="active"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
              {/* <li id="efficiency"><Link to="/efficiency">СНИЖЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ</Link></li> */}
              <li style={{ width: '100px' }}>&nbsp;</li>
              {path === "gant" && <form autoComplete="off">
                <li className="input-field">
                  <input type="text" className="datepicker" id="bDate" ref={this.bDate} />
                  <label htmlFor="bDate">Дата начала</label>
                </li>
                <li className="input-field">
                  <input type="text" className="datepicker" id="eDate" ref={this.eDate} />
                  <label htmlFor="eDate">Дата окончания</label>
                </li>
                <ul className="hide-on-small-and-down">
                  <li>
                    <a className="dropdown-trigger" href="#!" data-target="dropdown1">ЦЕХ<ArrowDownIcon className="menu-icon" /></a>

                    <ul id="dropdown1" className="dropdown-content z-depth-5">
                      {this.props.shops.map(shop => <li key={shop} onClick={e => this.clickShop(e)}>{shop}</li>)}
                    </ul>
                  </li>
                </ul>
              </form>}
            </ul>
            <div className="brand-logo">{this.state.currentShop}</div>
          </div>
          <div id="loading" className="loading"><img src="loading4.gif" height="50px" width="62px" alt="Loading.." /></div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
          <li id="gantS" className="waves-effect"><Link to="/gant">ДИАГРАММА ГАНТА</Link></li>
          <li id="efficiencyS" className="waves-effect"><Link to="/efficiency">СНИЖЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ</Link></li>
        </ul>
      </header>
    );
  }
}

const showTheLocationWithRouter = withRouter(NavMenu as any)
export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(showTheLocationWithRouter)

