import React, { useEffect } from 'react';
import M from 'materialize-css/dist/js/materialize.js'
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import { dbHandler } from "../../models/handlers/DbHandler";
import { IdleSet } from "../../models/types/gant";
import * as GantStore from '../../store/GantStore';
import moment from "moment";

type PanelProps = {
  shops: string[]
  setIdles: (idleSet: IdleSet) => GantStore.KnownAction
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
 * Draws gant panel
 */
export const GantSidePanel: React.FC<PanelProps> = (props: PanelProps) => {
  let dropdownM: any
  let dpBeginM: any
  let dpEndM: any
  let currentShop = ""
  let shopEl: HTMLAnchorElement
  let bDateEl: HTMLInputElement
  let eDateEl: HTMLInputElement
  let loadingEl: HTMLDivElement

  useEffect(() => {
    shopEl = document.getElementsByClassName("dd-hint")[0] as HTMLAnchorElement
    bDateEl = document.getElementById("bDate") as HTMLInputElement
    eDateEl = document.getElementById("eDate") as HTMLInputElement
    loadingEl = document.getElementById("loading") as HTMLDivElement

    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    dropdownM = M.Dropdown.init(dropdown)

    dpBeginM = M.Datepicker.init(document.getElementById("bDate"), { ...datepickerOptions, defaultDate: moment().toDate() })
    dpEndM = M.Datepicker.init(document.getElementById("eDate"), { ...datepickerOptions, defaultDate: moment().toDate() })

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
    const selectedShop = e ? (e.target as HTMLElement).textContent! : "Аглопроизводство"
    const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (currentShop !== selectedShop) {
      currentShop = selectedShop
      setTimeout(() => {
        shopEl.textContent = currentShop
        loadingEl.style.opacity = "1"
        dbHandler.getGantIdlesAsync(bDate, eDate, selectedShop)
          .then(data => props.setIdles(data))
          .catch((error: any) => {
            loadingEl.style.opacity = "0"
            if (error.message.includes(`Нет простоев`))
              alert(`Нет простоев для ${selectedShop}\nза период ${moment(bDate).format("DD.MM.YYYY")} ... ${moment(eDate).format("DD.MM.YYYY")}`)
            else
              console.error(error)
          })
      }, 0)
    }
  }

  const datePick = () => {
    const bDate = moment(bDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate! && currentShop !== "") {
      loadingEl.style.opacity = "1"

      dbHandler.getGantIdlesAsync(bDate, eDate, currentShop)
        .then(data => setTimeout(() => props.setIdles(data), 100))
        .catch((error: any) => {
          loadingEl.style.opacity = "0"
          !error.message.includes(`Нет простоев`) && console.error(error)
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