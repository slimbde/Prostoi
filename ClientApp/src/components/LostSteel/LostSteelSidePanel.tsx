import "../Layout/sidepanel.scss"
import React, { useEffect, useRef, useState } from 'react';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import M from 'materialize-css/dist/js/materialize.js'
import moment from "moment";
import { useActions, useStateSelector } from "../../store";





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


const LostSteelSidePanel: React.FC = () => {
  const bDateRef = useRef<HTMLInputElement>(null)
  const eDateRef = useRef<HTMLInputElement>(null)

  const [loadingEl, setLoadingEl] = useState<HTMLDivElement | undefined>()

  const {
    currentShop,
    loading,
    error,
    shops,
  } = useStateSelector(appState => appState.lostSteel)

  const { DOWNLOAD_LOSTS } = useActions().lostSteel


  useEffect(() => {
    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    const shopM = M.Dropdown.init(dropdown)

    const shopEl = document.getElementsByClassName("dd-hint")[0] as HTMLDivElement
    const loadingEl = document.getElementById("loading") as HTMLDivElement

    setLoadingEl(loadingEl)

    const dpBeginM = M.Datepicker.init(bDateRef.current!, { ...datepickerOptions, defaultDate: moment().subtract(2, "week").toDate() })
    const dpEndM = M.Datepicker.init(eDateRef.current!, { ...datepickerOptions, defaultDate: moment().subtract(1, "day").toDate() })

    //// datepickers doesn't see component state
    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => (el as HTMLElement).onclick = () => {
      const bDate = moment(bDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      const eDate = moment(eDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      bDate <= eDate && DOWNLOAD_LOSTS(bDate, eDate, shopEl.textContent!)
    })


    return () => {
      shopM && shopM.destroy()
      dpBeginM && dpBeginM.destroy()
      dpEndM && dpEndM.destroy()
    }
  }, [])


  useEffect(() => {
    if (!bDateRef.current) return
    clickShop(null)
    //eslint-disable-next-line
  }, [bDateRef.current])


  useEffect(() => {
    if (!error) return
    M.toast({ html: error.message })
    //eslint-disable-next-line  
  }, [error])

  useEffect(() => {
    loadingEl && (loadingEl.style.opacity = loading ? "1" : "0")
    //eslint-disable-next-line  
  }, [loading])


  const clickShop = async (e: any) => {
    const newShop = e ? (e.target as HTMLElement).textContent! : "МНЛЗ-5"
    const bDate = moment(bDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    currentShop !== newShop && DOWNLOAD_LOSTS(bDate, eDate, newShop)
  }



  return <ul className={`sidepanel${loading ? " inactive" : ""}`}>
    <li className="input-field" id="dd-trigger" data-target="dropdown3">
      <a className="dropdown-trigger" href="#" data-target="dropdown3">
        ЦЕХ
        <ArrowDownIcon className="menu-icon" />
        <div className="dd-hint">{currentShop}</div>
      </a>
      <ul id="dropdown3" className="dropdown-content z-depth-5">{shops.map(shop =>
        <li key={shop} onClick={clickShop}>{shop}</li>
      )}</ul>
    </li>
    <div className="sidepanel-datepickers">
      <li className="input-field">
        <input type="text" className="datepicker" ref={bDateRef} id="bDate" autoComplete="off" />
        <label htmlFor="bDate">НАЧАЛО</label>
      </li>
      <li className="input-field">
        <input type="text" className="datepicker" ref={eDateRef} id="eDate" autoComplete="off" />
        <label htmlFor="eDate">ОКОНЧАНИЕ</label>
      </li>
    </div>
  </ul>
};

export default LostSteelSidePanel
