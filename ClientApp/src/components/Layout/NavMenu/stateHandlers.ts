import { NavMenuProps, NavMenuState } from '.';
import * as GantStore from '../../../store/Gant';
import * as CastStore from '../../../store/LostCast'
import steelMarksMNLZ5 from './steelMarksMNLZ5.json'
import M from 'materialize-css/dist/js/materialize.js'
import moment from "moment"


type LostCastResponse = {
  day: Date,
  mark: string,
  pid: string,
  density: number,
  width: number,
  thickness: number,
  count: number,
  undercastLength: number,
  undercastWidth: number,
  undercastThickness: number,
  undercastDensity: number,
}


type MenuStateHandler = {
  stateHandler: INavMenuStateHandler
}

type ManagedNavMenu = React.Component<NavMenuProps, NavMenuState> & MenuStateHandler


///////////////////////////////////////////////////////////////////// SUPER ABSTRACT NAV HANDLER
export abstract class INavMenuStateHandler {
  protected sideNav: any;
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

    if (this instanceof GantNavHandler)
      this.clickShop()
    else
      this.datePick()

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
  protected dropdown: any

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

  constructor(nav: ManagedNavMenu) {
    super(nav)
    console.log("it's me, casthandler")

    this.beginDate = moment().subtract(14, "day").toDate()
    this.endDate = moment().subtract(1, "day").toDate()

    nav.state && !nav.state.firstLoad && this.didMount()
  }

  clickShop(e?: React.MouseEvent<HTMLLIElement, MouseEvent>) { }

  public datePick = () => {
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate!) {
      this.loading!.style.opacity = "1"
      fetch(`api/Idle/GetMNLZ5LostIdles?bDate=${bDate}&eDate=${eDate}`)
        .then(resp => resp.json() as Promise<LostCastResponse[]>)
        .then(data => {
          const result: CastStore.LostCast[] = data.map(lcr => {
            // ищу нужный профиль из предоставленного Яшей .json файла:
            const profile = steelMarksMNLZ5.find(profile => profile.width === lcr.width && profile.thickness === lcr.thickness) || steelMarksMNLZ5[0]

            // ищу марку с названием из SQL запроса в профиле из .json файла
            const existedMark = profile.Marks.find(pm => pm.Name === lcr.mark)

            // если марка не задана, то беру из поля default профиля, иначе - заданное значение
            const speed = (existedMark ? profile.Marks[existedMark.Quotient] : profile.Default) as number

            // считаю длину - скорость умножить на количество минут (по таблице)
            const idleBeamLengthMeters = speed * lcr.count / 1000

            // константа "промежуточное значение" из таблицы
            const transientVal = (lcr.thickness / 1000) * (lcr.width / 1000) || 0.04  // если в базе нули - то 200х200

            // считаю объем неотлитого металла по формуле из таблицы - длина * промежуточное значение
            const lostIdleMetalVolume = idleBeamLengthMeters * transientVal

            // считаю вес - объем неотлитого металла * плотность из запроса
            const idleWeight = lostIdleMetalVolume * lcr.density / 1000   ///////////// значение по Простоям

            ///// ВТОРАЯ ЧАСТЬ - СНИЖЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ. перевожу длину в метры
            const lostEfficiencyLengthMeters = lcr.undercastLength / 1000

            // константа "промежуточное значение" для снижения (тут другой профиль может оказаться)
            const undercastTransientVal = (lcr.undercastThickness / 1000) * (lcr.undercastWidth / 1000) || 0.04

            // считаю объем неотлитого металла
            const lostEfficiencyMetalVolume = lostEfficiencyLengthMeters * undercastTransientVal

            // читаю вес - объем неотлитого металла * плотность из запроса
            const efficiencyWeight = lostEfficiencyMetalVolume * lcr.undercastDensity / 1000 ///////////// значение по Эффективности

            // расчет долей
            const sumLost = idleWeight + efficiencyWeight
            const idlePercent = idleWeight / sumLost * 100
            const efficiencyPercent = efficiencyWeight / sumLost * 100

            return {
              date: moment(lcr.day).format("YYYY-MM-DD"),
              lostIdle: Math.round(idleWeight),
              lostEfficiency: Math.round(efficiencyWeight),
              lostIdlePercent: Math.round(idlePercent),
              lostEfficiencyPercent: Math.round(efficiencyPercent)
            }
          })

          setTimeout(() => this.nav.props.setLostCasts(result), 200)
        })
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