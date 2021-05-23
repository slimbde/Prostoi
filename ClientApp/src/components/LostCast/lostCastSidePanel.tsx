import React, { useEffect } from 'react';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import * as CastStore from '../../store/LostCastStore'
import * as MNLZHandlers from "../../models/handlers/LostCastHandlers";
import { LostCast } from "../../models/types/lostCast";
import M from 'materialize-css/dist/js/materialize.js'
import moment from "moment";

type PanelProps = {
  shops: string[]
  setLostCasts: (data: LostCast[]) => CastStore.KnownAction
}

const datepickerOptions = {
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

/**
 * Draws LostCast panel
 */
export const LostCastSidePanel: React.FC<PanelProps> = (props: PanelProps) => {
  let dropdownM: any
  let dpBeginM: any
  let dpEndM: any
  let currentShop = ""
  let shopEl: HTMLAnchorElement
  let bDateEl: HTMLInputElement
  let eDateEl: HTMLInputElement
  let loadingEl: HTMLDivElement
  let handler: MNLZHandlers.IMNLZHandler

  useEffect(() => {
    shopEl = document.getElementsByClassName("dd-hint")[0] as HTMLAnchorElement
    bDateEl = document.getElementById("bDate") as HTMLInputElement
    eDateEl = document.getElementById("eDate") as HTMLInputElement
    loadingEl = document.getElementById("loading") as HTMLDivElement
    loadingEl.style.display = "block"

    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    dropdownM = M.Dropdown.init(dropdown)

    dpBeginM = M.Datepicker.init(bDateEl, { ...datepickerOptions, defaultDate: moment().subtract(14, "day").toDate() })
    dpEndM = M.Datepicker.init(eDateEl, { ...datepickerOptions, defaultDate: moment().subtract(1, "day").toDate() })

    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => el.addEventListener("click", () => datePick()))

    clickShop(null)

    return () => {
      dropdownM && dropdownM.destroy()
      dpBeginM && dpBeginM.destroy()
      dpEndM && dpEndM.destroy()
    }
  }, [])


  const clickShop = (e: any) => {
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "МНЛЗ-2"

    if (currentShop !== selectedShop) {
      currentShop = selectedShop
      shopEl.textContent = currentShop

      switch (selectedShop) {
        case "МНЛЗ-2": handler = new MNLZHandlers.MNLZ2Handler(); break
        case "МНЛЗ-5": handler = new MNLZHandlers.MNLZ5Handler(); break
        default: throw new Error("[CastLostNavHandler]: couldn't initialize IMNLZHandler")
      }

      datePick()
    }
  }

  const datePick = () => {
    const bDate = moment(bDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate!) {
      loadingEl.style.opacity = "1"
      handler!.CalculateForAsync(bDate, eDate)
        .then(result => props.setLostCasts(result))
        .catch(error => {
          loadingEl.style.opacity = "0"
          console.error(error)
          //alert(error.message)
        })
    }
  }

  const assembleDropEls = (shops: string[]) => shops.map(shop => <li key={shop} onClick={e => clickShop(e)}>{shop}</li>)

  return <>
    <ul className="sidepanel-content">
      <li className="input-field" id="dd-trigger" data-target="dropdown3" >
        <a className="dropdown-trigger" href="#" data-target="dropdown3">ЦЕХ<ArrowDownIcon className="menu-icon" /><div className="dd-hint">{currentShop}</div></a>
        <ul id="dropdown3" className="dropdown-content z-depth-5">{assembleDropEls(props.shops)}</ul>
      </li>
      <div className="sidepanel-datepickers">
        <li className="input-field">
          <input type="text" className="datepicker" id="bDate" autoComplete="off" />
          <label htmlFor="bDate">НАЧАЛО</label>
        </li>
        <li className="input-field">
          <input type="text" className="datepicker" id="eDate" autoComplete="off" />
          <label htmlFor="eDate">ОКОНЧАНИЕ</label>
        </li>
      </div>
    </ul>
  </>
};