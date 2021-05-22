import React, { useEffect } from 'react';
import M from 'materialize-css/dist/js/materialize.js'
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown'
import { dbProxy } from "../../models/handlers/DbProxy";
import { Usage } from "../../models/types/stats";
import * as StatsStore from '../../store/StatsStore'
import moment from "moment";

type PanelProps = {
  ips: string[]
  setUsages: (usageList: Usage[]) => StatsStore.KnownAction
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
 * Draws stats panel
 */
export const StatsSidePanel: React.FC<PanelProps> = (props: PanelProps) => {
  let dropdownM: any
  let dpBeginM: any
  let dpEndM: any
  let currentIp = ""
  let ipEl: HTMLAnchorElement
  let bDateEl: HTMLInputElement
  let eDateEl: HTMLInputElement
  let loadingEl: HTMLDivElement

  useEffect(() => {
    ipEl = document.getElementsByClassName("ip-hint")[0] as HTMLAnchorElement
    bDateEl = document.getElementById("bDate") as HTMLInputElement
    eDateEl = document.getElementById("eDate") as HTMLInputElement
    loadingEl = document.getElementById("loading") as HTMLDivElement

    const dropdown = document.getElementById("dd-trigger") as HTMLUListElement
    dropdownM = M.Dropdown.init(dropdown)

    dpBeginM = M.Datepicker.init(bDateEl, { ...datepickerOptions, defaultDate: moment("2020-01-01").toDate() })
    dpEndM = M.Datepicker.init(eDateEl, { ...datepickerOptions, defaultDate: moment().toDate() })

    const datepickerDoneBtns = document.querySelectorAll('.datepicker-done')
    datepickerDoneBtns.forEach(el => el.addEventListener("click", () => datePick()))

    clickIp(null)

    return () => {
      dropdownM && dropdownM.destroy()
      dpBeginM && dpBeginM.destroy()
      dpEndM && dpEndM.destroy()
    }
  }, [])


  const clickIp = (e: any) => {
    const selectedIp = e ? (e.target as HTMLElement).textContent! : "ВСЕ"
    const bDate = moment(bDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (currentIp !== selectedIp) {
      setTimeout(() => {
        loadingEl.style.opacity = "1"
        dbProxy.getUsageForAsync(bDate, eDate, selectedIp)
          .then(data => {
            loadingEl.style.opacity = "0"
            ipEl.textContent = selectedIp
            currentIp = selectedIp
            props.setUsages(data)
          })
          .catch((error: any) => {
            dbProxy.remove(`${bDate}${eDate}${selectedIp}`)
            loadingEl.style.opacity = "0"
            if (error.message.includes(`Нет посещений`))
              alert(`Нет посещений для ${selectedIp}\nза период ${moment(bDate).format("DD.MM.YYYY")} ... ${moment(eDate).format("DD.MM.YYYY")}`)
            else
              console.error(error)
          })
      }, 0)
    }
  }

  const datePick = () => {
    const bDate = moment(bDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")
    const eDate = moment(eDateEl.value, "DD.MM.YYYY").format("YYYY-MM-DD")

    if (bDate! <= eDate! && currentIp !== "") {
      loadingEl.style.opacity = "1"

      dbProxy.getUsageForAsync(bDate, eDate, currentIp)
        .then(data => {
          props.setUsages(data)
          loadingEl.style.opacity = "0"
        })
        .catch((error: any) => {
          dbProxy.remove(`${bDate}${eDate}${currentIp}`)
          loadingEl.style.opacity = "0"
          !error.message.includes(`Нет посещений`) && console.error(error)
        })
    }
  }

  const assembleDropEls = (ips: string[]) => [<li key={"all"} onClick={e => clickIp(e)}>ВСЕ</li>, ...ips.map(ip => <li key={ip} onClick={e => clickIp(e)}>{ip}</li>)]

  return <>
    <ul className="sidepanel-content">
      <li className="input-field" id="dd-trigger" data-target="dropdown3" >
        <a className="dropdown-trigger" href="#" data-target="dropdown3">IP<ArrowDownIcon className="menu-icon" /><div className="ip-hint">{currentIp}</div></a>
        <ul id="dropdown3" className="dropdown-content z-depth-5">{assembleDropEls(props.ips)}</ul>
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