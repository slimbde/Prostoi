import * as React from 'react'
import moment from 'moment'

export default () => <div className="footer">
  <a href="mailto:GrigoriyDolgiy@mechel.ru">Версия: {moment().format("DD.MM.YYYY.HH.mm")}</a>
</div >