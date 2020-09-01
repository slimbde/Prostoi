import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import MenuIcon from "@material-ui/icons/Menu"
import CashIcon from '@material-ui/icons/Euro'
import CardIcon from '@material-ui/icons/CreditCard'
import OverallIcon from '@material-ui/icons/Save'
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import AccountIcon from '@material-ui/icons/AccountCircle'
import AssignmentReturn from '@material-ui/icons/AssignmentReturn'
import M from 'materialize-css/dist/js/materialize.js'

class NavMenu extends React.PureComponent<{ location: any, logout: any, userName: string }, {}> {
  private sideNav: any;
  private profileMenu: any

  componentDidMount() {
    this.sideNav = M.Sidenav.init(document.getElementById("mobile-demo"))
    this.profileMenu = M.Dropdown.init(document.querySelector(".dropdown-trigger"))
    document.querySelectorAll(".nav-wrapper ul li").forEach(li => li.classList.add("waves-effect"))
  }
  componentWillUnmount() {
    this.sideNav && this.sideNav.destroy()
    this.profileMenu && this.profileMenu.destroy()
  }


  public render() {
    const previousActive = document.querySelectorAll("ul > li.active")!
    previousActive.forEach(p => p.classList.remove("active"))

    const path = this.props.location.pathname.slice(1) || "brand-logo"
    const li = document.getElementById(path)!
    const liS = document.getElementById(path + "S")!
    li && li.classList.add("active")
    liS && liS.classList.add("active")

    return (
      <header>
        <nav>
          <div className="nav-wrapper blue darken-2">
            <Link className="brand-logo" to="/">Учет расходов</Link>
            <Link to="#" data-target="mobile-demo" className="sidenav-trigger"><MenuIcon className="menu-icon" /></Link>
            <ul className="right hide-on-med-and-down">
              <li id="cash"><Link to="/cash"><CashIcon className="menu-icon" />Наличные</Link></li>
              <li id="credit"><Link to="/credit"><CardIcon className="menu-icon" />Карта</Link></li>
              <li id="overall"><Link to="/overall"><OverallIcon className="menu-icon" />Сводная</Link></li>

              <ul className="right hide-on-small-and-down">
                <li>
                  <a className="dropdown-trigger" href="#!" data-target="dropdown1">
                    {this.props.userName}
                    <ArrowDownIcon className="menu-icon" />
                  </a>

                  <ul id="dropdown1" className="dropdown-content">
                    <li>
                      <Link to="/profile" className="blue-text"><AccountIcon className="menu-icon" />ПРОФИЛЬ</Link>
                    </li>
                    <li className="divider" tabIndex={-1} ></li>
                    <li id="logout">
                      <Link to="/" className="blue-text" onClick={() => this.props.logout()}><AssignmentReturn className="menu-icon" />ВЫЙТИ</Link>
                    </li>
                  </ul>
                </li>
              </ul>

            </ul>
          </div>
        </nav>

        <ul className="sidenav blue lighten-5" id="mobile-demo">
          <li id="cashS"><Link to="/cash"><CashIcon className="menu-icon" />НАЛИЧНЫЕ</Link></li>
          <li id="creditS"><Link to="/credit"><CardIcon className="menu-icon" />КАРТА</Link></li>
          <li id="overallS"><Link to="/overall"><OverallIcon className="menu-icon" />СВОДНАЯ</Link></li>
          <li><Link to="/profile"><AccountIcon className="menu-icon" />ПРОФИЛЬ</Link></li>
          <li><Link to="/" onClick={() => this.props.logout()}><AssignmentReturn className="menu-icon" />ВЫЙТИ</Link></li>
        </ul>
      </header >
    );
  }
}

export default withRouter(NavMenu as any);
