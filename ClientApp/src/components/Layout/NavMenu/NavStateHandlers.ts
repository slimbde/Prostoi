import { NavMenuProps } from '.';
import { dbHandler } from "../../../models/handlers/DbHandler";
import * as MNLZHandlers from '../../../models/handlers/LostCastHandlers'
import M from 'materialize-css/dist/js/materialize.js'
import moment from "moment"



type MenuStateHandler = {
  stateHandler: INavMenuStateHandler | undefined
}

type ManagedNavMenu = React.Component<NavMenuProps> & MenuStateHandler


///////////////////////////////////////////////////////////////////// SUPER ABSTRACT NAV HANDLER
export abstract class INavMenuStateHandler {
  protected dropdown: any

  protected datePickerBegin: any
  protected datePickerEnd: any
  protected nav: ManagedNavMenu
  protected loading: HTMLElement | undefined
  protected datepickerDoneBtns: NodeList | undefined
  public currentShop: string = ""

  protected abstract datePick(): void
  public abstract clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>): void


  protected datepickerOptions = {
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
    this.loading = document.getElementById("loading") as HTMLElement

    setTimeout(() => {
      const dropdown = document.querySelector(".dropdown-trigger") as HTMLSelectElement
      this.dropdown = M.Dropdown.init(dropdown)
    }, 0)
  }

  public dispose() {
    this.dropdown.destroy()
    this.nav.props.clearIdles()
    this.nav.props.clearLostCasts()
  }
}


///////////////////////////////////////////////////////////////////// GANT NAV HANDLER
export class GantNavHandler extends INavMenuStateHandler {

  constructor(nav: ManagedNavMenu) {
    super(nav)
    console.log("yeey! It's me, ganthandler")

    this.datePickerBegin = M.Datepicker.init(document.getElementById("bDate"), { ...this.datepickerOptions, defaultDate: moment().toDate() })
    this.datePickerEnd = M.Datepicker.init(document.getElementById("eDate"), { ...this.datepickerOptions, defaultDate: moment().toDate() })

    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => el.addEventListener("click", () => this.datePick()))

    this.clickShop()
  }

  public datePick = () => {
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate! && this.currentShop !== "") {
      this.loading!.style.opacity = "1"

      dbHandler.getGantIdlesAsync(bDate, eDate, this.currentShop)
        .then(data => setTimeout(() => this.nav.props.setIdles(data), 100))
        .catch((error: any) => {
          this.loading!.style.opacity = "0"
          console.error(error)
          //alert(error.message)
        })
    }
  }

  public clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "Аглопроизводство"
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (this.currentShop !== selectedShop) {
      this.currentShop = selectedShop
      setTimeout(() => {
        this.loading!.style.opacity = "1"
        dbHandler.getGantIdlesAsync(bDate, eDate, selectedShop)
          .then(data => this.nav.props.setIdles(data))
          .catch((error: any) => {
            this.loading!.style.opacity = "0"
            console.error(error)
            //alert(error.message)
          })
      }, 0)
    }
  }
}


///////////////////////////////////////////////////////////////////// CAST LOST NAV HANDLER
export class CastLostNavHandler extends INavMenuStateHandler {
  private handler?: MNLZHandlers.IMNLZHandler

  constructor(nav: ManagedNavMenu) {
    super(nav)
    console.log("yeey! It's me, casthandler")

    this.datePickerBegin = M.Datepicker.init(document.getElementById("bDate"), { ...this.datepickerOptions, defaultDate: moment().subtract(14, "day").toDate() })
    this.datePickerEnd = M.Datepicker.init(document.getElementById("eDate"), { ...this.datepickerOptions, defaultDate: moment().subtract(1, "day").toDate() })

    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => el.addEventListener("click", () => this.datePick()))

    this.clickShop()
  }

  clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "МНЛЗ-2"

    if (this.currentShop !== selectedShop) {
      this.currentShop = selectedShop
      switch (selectedShop) {
        case "МНЛЗ-2": this.handler = new MNLZHandlers.MNLZ2Handler(); break
        case "МНЛЗ-5": this.handler = new MNLZHandlers.MNLZ5Handler(); break
        default: throw new Error("[CastLostNavHandler]: couldn't initialize IMNLZHandler")
      }

      this.datePick()
    }
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
          //alert(error.message)
        })
    }
  }
}