import { NavMenuProps, NavMenuState } from '.';
import * as GantStore from '../../../store/Gant';
import * as MNLZHandlers from '../../businessLogic/LostCastHandlers'
import M from 'materialize-css/dist/js/materialize.js'
import moment from "moment"



type MenuStateHandler = {
  stateHandler: INavMenuStateHandler
}

type ManagedNavMenu = React.Component<NavMenuProps, NavMenuState> & MenuStateHandler


///////////////////////////////////////////////////////////////////// SUPER ABSTRACT NAV HANDLER
export abstract class INavMenuStateHandler {
  protected dropdown: any
  protected sideNav: any
  protected beginDate: Date | undefined
  protected endDate: Date | undefined

  protected datePickerBegin: any
  protected datePickerEnd: any
  protected nav: ManagedNavMenu
  protected loading: HTMLElement | undefined
  protected datepickerDoneBtns: NodeList | undefined

  protected abstract datePick(): void
  public abstract clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>): void


  public datepickerOptions = {
    format: "dd.mm.yyyy",
    setDefaultDate: true,
    firstDay: 1,
    //autoClose: true,
    //onClose: () => this.datePick(),
    maxDate: moment().toDate(),
    i18n: {
      months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
      weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      weekdaysAbbrev: ["В", "Пн", "В", "С", "Ч", "Пт", "С"],
      cancel: "Отмена",
    }
  }


  constructor(nav: ManagedNavMenu) {
    this.nav = nav
  }


  public switchState(to: string) {
    switch (to) {
      case "castlost":
        this.nav.stateHandler = new CastLostNavHandler(this.nav)
        break
      case "gant":
        this.nav.stateHandler = new GantNavHandler(this.nav)
        break
      default: break
    }
  }


  public didMount() {
    //console.log("abstract did mount")
    this.datePickerBegin = M.Datepicker.init(document.getElementById("bDate"), { ...this.datepickerOptions, defaultDate: this.beginDate })
    this.datePickerEnd = M.Datepicker.init(document.getElementById("eDate"), { ...this.datepickerOptions, defaultDate: this.endDate })

    this.loading = document.getElementById("loading") as HTMLElement

    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => el.addEventListener("click", () => this.datePick()))

    this.clickShop()

    this.nav.state.firstLoad && this.nav.setState({ firstLoad: false })
  }

  public abstract didUpdate(prevProps: NavMenuProps): void

  public willUnmount() {
    this.sideNav && this.sideNav.destroy()
    this.datePickerBegin && this.datePickerBegin.destroy()
    this.datePickerEnd && this.datePickerEnd.destroy()
  }

}


///////////////////////////////////////////////////////////////////// GANT NAV HANDLER
export class GantNavHandler extends INavMenuStateHandler {

  constructor(nav: ManagedNavMenu) {
    super(nav)
    console.log("it's me, ganthandler")

    this.beginDate = moment().toDate()
    this.endDate = moment().toDate()

    setTimeout(() => {
      const dropdown = document.querySelector(".dropdown-trigger") as HTMLSelectElement
      this.dropdown = M.Dropdown.init(dropdown)
    }, 0)

    nav.state && !nav.state.firstLoad && this.didMount()
  }

  public datePick = () => {
    const selectedShop = this.nav.state.currentShop
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate! && this.nav.state.currentShop !== "") {
      this.loading!.style.opacity = "1"
      fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${selectedShop}`)
        .then(resp => resp.json() as Promise<GantStore.IdleSet>)
        .then(data => setTimeout(() => this.nav.props.setIdles(data), 100))
    }
  }

  public clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "Аглопроизводство"
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (selectedShop !== this.nav.state.currentShop) {
      this.loading!.style.opacity = "1"
      setTimeout(() => {
        fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${selectedShop}`)
          .then(resp => resp.json())
          .then(data => this.nav.props.setIdles(data))
      }, 300)

      this.nav.setState({ currentShop: selectedShop })
    }
  }

  public didUpdate(prevProps: NavMenuProps) {
    //console.log("ganthandler did update")
    const prevPath = prevProps.location.pathname
    const thisPath = this.nav.props.location.pathname

    if (prevPath !== thisPath && prevPath !== "/") {
      this.dropdown.destroy()
      this.nav.props.clearIdles()
      this.nav.setState({ currentShop: "" })
      this.switchState("castlost")
    }
  }
}


///////////////////////////////////////////////////////////////////// CAST LOST NAV HANDLER
export class CastLostNavHandler extends INavMenuStateHandler {
  private handler?: MNLZHandlers.IMNLZHandler

  constructor(nav: ManagedNavMenu) {
    super(nav)
    console.log("it's me, casthandler")

    this.beginDate = moment().subtract(14, "day").toDate()
    this.endDate = moment().subtract(1, "day").toDate()

    setTimeout(() => {
      const dropdown = document.querySelector(".dropdown-trigger") as HTMLSelectElement
      this.dropdown = M.Dropdown.init(dropdown)
    }, 0)

    nav.state && !nav.state.firstLoad && this.didMount()
  }

  clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "МНЛЗ-2"

    this.nav.setState({ currentShop: selectedShop }, () => {
      switch (this.nav.state.currentShop) {
        case "МНЛЗ-2": this.handler = new MNLZHandlers.MNLZ2Handler(); break
        case "МНЛЗ-5": this.handler = new MNLZHandlers.MNLZ5Handler(); break
        default: throw new Error("[CastLostNavHandler]: couldn't initialize IMNLZHandler")
      }

      this.datePick()
    })
  }

  public datePick = () => {
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate!) {
      this.loading!.style.opacity = "1"
      this.handler!.CalculateForAsync(bDate, eDate)
        .then(result => setTimeout(() => this.nav.props.setLostCasts(result), 200))
        .catch(error => {
          this.loading!.style.opacity = "0"
          console.error(error)
          alert(error)
        })
    }
  }

  public didUpdate(prevProps: NavMenuProps) {
    //console.log("casthandler did update")
    const prevPath = prevProps.location.pathname
    const thisPath = this.nav.props.location.pathname

    if (prevPath !== thisPath) {
      this.nav.props.clearLostCasts()
      this.switchState("gant")
    }
  }
}