import "../Layout/sidepanel.scss"
import moment from "moment";
import React, { useEffect, useState } from 'react';
import M from 'materialize-css/dist/js/materialize.js'
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import { useActions, useStateSelector } from "../../store";



type State = {
  bDateEl?: HTMLInputElement
  eDateEl?: HTMLInputElement
  loadingEl?: HTMLDivElement
}


const datepickerOptions = {
  format: "dd.mm.yyyy",
  setDefaultDate: true,
  firstDay: 1,
  //autoClose: true,
  //onClose: () => datePick(),
  maxDate: moment().toDate(),
  i18n: {
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    weekdaysAbbrev: ["В", "Пн", "В", "С", "Ч", "Пт", "С"],
    cancel: "Отмена",
  },
}


export default () => {

  const [state, setState] = useState<State>({
    bDateEl: undefined,
    eDateEl: undefined,
    loadingEl: undefined,
  })

  const {
    currentShop,
    loading,
    error,
    shops,
  } = useStateSelector(appState => appState.gant)

  const { DOWNLOAD_SHOPS, DOWNLOAD_IDLES } = useActions().gant
  const { DOWNLOAD_IPS } = useActions().stats


  useEffect(() => {
    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    const shopM = M.Dropdown.init(dropdown)

    const bDateEl = document.getElementById("bDate") as HTMLInputElement
    const eDateEl = document.getElementById("eDate") as HTMLInputElement
    const shopEl = document.getElementsByClassName("dd-hint")[0] as HTMLDivElement
    const loadingEl = document.getElementById("loading") as HTMLDivElement


    const dpBeginM = M.Datepicker.init(bDateEl, { ...datepickerOptions, defaultDate: moment().toDate() })
    const dpEndM = M.Datepicker.init(eDateEl, { ...datepickerOptions, defaultDate: moment().toDate() })

    //// datepickers doesn't see component state
    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => (el as HTMLElement).onclick = () => {
      const bDate = moment(bDateEl!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      const eDate = moment(eDateEl!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      bDate <= eDate && DOWNLOAD_IDLES(bDate, eDate, shopEl.textContent!)
    })

    setState(state => ({ ...state, bDateEl, eDateEl, loadingEl }))

    DOWNLOAD_SHOPS()

    return () => {
      shopM && shopM.destroy()
      dpBeginM && dpBeginM.destroy()
      dpEndM && dpEndM.destroy()
    }
  }, [])

  useEffect(() => {
    if (shops.length < 1) return
    clickShop(null)
    //eslint-disable-next-line  
  }, [shops])

  useEffect(() => {
    if (!error) return
    M.toast({ html: error.message })
    //eslint-disable-next-line  
  }, [error])

  useEffect(() => {
    state.loadingEl && (state.loadingEl.style.opacity = loading ? "1" : "0")
    //eslint-disable-next-line  
  }, [loading])


  const clickShop = (e: any) => {
    const newShop = e ? (e.target as HTMLElement).textContent! : "Аглопроизводство"
    const bDate = moment(state.bDateEl!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(state.eDateEl!.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    currentShop !== newShop && DOWNLOAD_IDLES(bDate, eDate, newShop)
  }




  return <ul className={`sidepanel${loading ? " inactive" : ""}`}>
    <li className="input-field" id="dd-trigger" data-target="dropdown3">
      <a className="dropdown-trigger" href="#" data-target="dropdown3">
        ЦЕХ
        <ArrowDownIcon className="menu-icon" />
        <div className="dd-hint">{currentShop}</div>
      </a>
      <ul id="dropdown3" className="dropdown-content z-depth-5">{shops.map(shop =>
        <li key={shop} onClick={e => clickShop(e)}>{shop}</li>
      )}</ul>
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
}

