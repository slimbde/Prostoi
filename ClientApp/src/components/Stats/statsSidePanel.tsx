import React, { useEffect, useRef, useState } from 'react';
import M from 'materialize-css/dist/js/materialize.js'
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import moment from "moment";
import { useActions, useStateSelector } from "store";



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


export default () => {
  const bDateRef = useRef<HTMLInputElement>(null)
  const eDateRef = useRef<HTMLInputElement>(null)

  const [loadingEl, setLoadingEl] = useState<HTMLDivElement | undefined>()

  const {
    loading,
    currentIp,
    error,
    ips,
  } = useStateSelector(appState => appState.stats)

  const { DOWNLOAD_IPS, DOWNLOAD_USAGES } = useActions().stats


  useEffect(() => {
    const ipEl = document.getElementsByClassName("ip-hint")[0] as HTMLAnchorElement
    const loadingEl = document.getElementById("loading") as HTMLDivElement

    setLoadingEl(loadingEl)

    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    const ipM = M.Dropdown.init(dropdown)

    const dpBeginM = M.Datepicker.init(bDateRef.current!, { ...datepickerOptions, defaultDate: moment("2020-01-01").toDate() })
    const dpEndM = M.Datepicker.init(eDateRef.current!, { ...datepickerOptions, defaultDate: moment().toDate() })

    //// datepickers doesn't see component state
    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => (el as HTMLElement).onclick = () => {
      const bDate = moment(bDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      const eDate = moment(eDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
      bDate <= eDate && DOWNLOAD_USAGES(bDate, eDate, ipEl.textContent!)
    })


    const dpFooter = document.getElementsByClassName("confirmation-btns")[0] as HTMLButtonElement
    const todayBtn = document.createElement("button")
    todayBtn.classList.add("today-button", "btn-flat", "waves-effect")
    todayBtn.textContent = "Сегодня"
    todayBtn.onclick = (e) => { dpBeginM.gotoDate(new Date()) }
    dpFooter.appendChild(todayBtn)

    ips.length < 1 && DOWNLOAD_IPS()

    return () => {
      ipM && ipM.destroy()
      dpBeginM && dpBeginM.destroy()
      dpEndM && dpEndM.destroy()
    }
  }, [])


  useEffect(() => {
    if (ips.length < 1) return
    clickIp(null)
    //eslint-disable-next-line  
  }, [ips])

  useEffect(() => {
    if (!error) return
    M.toast({ html: error.message })
    //eslint-disable-next-line  
  }, [error])

  useEffect(() => {
    loadingEl && (loadingEl.style.opacity = loading ? "1" : "0")
    //eslint-disable-next-line  
  }, [loading])



  const clickIp = (e: any) => {
    const newIp = e ? (e.target as HTMLElement).textContent! : "ВСЕ"
    const bDate = moment(bDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateRef.current!.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    currentIp !== newIp && DOWNLOAD_USAGES(bDate, eDate, newIp)
  }



  return <ul className={`sidepanel${loading ? " inactive" : ""}`}>
    <li className="input-field" id="dd-trigger" data-target="dropdown3" >
      <a className="dropdown-trigger" href="#" data-target="dropdown3">
        IP
        <ArrowDownIcon className="menu-icon" />
        <div className="ip-hint">{currentIp}</div>
      </a>
      <ul id="dropdown3" className="dropdown-content z-depth-5">
        <li key={"all"} onClick={e => clickIp(e)}>ВСЕ</li>
        {ips.map(ip => <li key={ip} onClick={e => clickIp(e)}>{ip}</li>)}
      </ul>
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
}


