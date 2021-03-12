import mnlz5Config from '../../data/mnlz5-config.json'
import mnlz2Config from '../../data/mnlz2-config.json'
import mnlz2Density from '../../data/mnlz2-markDensity.json'
import { dbHandler, LostCastResponse } from "./DbHandler"
import { LostCast } from "../types/lostCast"
import moment from 'moment'


type DensityList = {
  [index: string]: number
}


type Mark = {
  Name: string
  Quotient: number
}




export interface IMNLZHandler {
  CalculateForAsync(bDate: string, eDate: string): Promise<LostCast[]>
}


/////////////////////////////////////////////////////////////////////////////////////////// TMNLZ2Handler
export abstract class TMNLZHandler implements IMNLZHandler {
  protected api: string = ""

  async CalculateForAsync(bDate: string, eDate: string): Promise<LostCast[]> {
    const data = await dbHandler.getMnlzIdlesAsync(this.api, bDate, eDate)

    const result = data.map<LostCast>((lcr: LostCastResponse) => {
      // ищу нужный профиль
      const profile = this.findProfile(lcr)//mnlz2Config.find(profile => profile.Name === lcr.profile.split("X")[0]) || mnlz2Config[0]

      // ищу пару марка-скорость
      const markSpeed = profile.Marks.find((pm: Mark) => pm.Name.toUpperCase() === lcr.mark.toUpperCase())

      // если марка не задана, то беру из поля default профиля, иначе - заданное значение
      const speed = (markSpeed ? markSpeed.Quotient : profile.Default) as number

      // считаю длину - скорость умножить на количество минут (по таблице)
      const idleBeamLengthMeters = speed * lcr.count / 1000

      // константа "промежуточное значение" из таблицы
      const transientVal = (lcr.thickness / 1000) * (lcr.width / 1000) || 0.04  // если в базе нули - то 200х200

      // считаю объем неотлитого металла по формуле из таблицы - длина * промежуточное значение
      const lostIdleMetalVolume = idleBeamLengthMeters * transientVal

      const density = this.findDensity(lcr)//(mnlz2Density as DensityList)[lcr.mark.toUpperCase()]

      // считаю вес - объем неотлитого металла * плотность из запроса
      const idleWeight = lostIdleMetalVolume * (density ? density : 7800) / 1000   ///////////// значение по Простоям

      ///// ВТОРАЯ ЧАСТЬ - СНИЖЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ. перевожу длину в метры
      const lostEfficiencyLengthMeters = lcr.undercastLength / 1000

      // константа "промежуточное значение" для снижения (тут другой профиль может оказаться)
      const undercastTransientVal = (lcr.undercastThickness / 1000) * (lcr.undercastWidth / 1000) || 0.04

      // считаю объем неотлитого металла
      const lostEfficiencyMetalVolume = lostEfficiencyLengthMeters * undercastTransientVal

      // считаю вес - объем неотлитого металла * плотность из запроса
      const efficiencyWeight = lostEfficiencyMetalVolume * density / 1000 ///////////// значение по Эффективности

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

    return result
  }


  protected abstract findProfile(lcr: LostCastResponse): any
  protected abstract findDensity(lcr: LostCastResponse): number
}



/////////////////////////////////////////////////////////////////////////////////////////// MNLZ2Handler
export class MNLZ2Handler extends TMNLZHandler {
  constructor() {
    super()
    this.api = "GetMNLZ2LostIdles"
  }

  findProfile(lcr: LostCastResponse): any {
    return mnlz2Config.find(profile => profile.Name === lcr.profile.split("X")[0]) || mnlz2Config[0]
  }

  findDensity(lcr: LostCastResponse): number {
    return (mnlz2Density as DensityList)[lcr.mark.toUpperCase()]
  }
}


/////////////////////////////////////////////////////////////////////////////////////////// MNLZ2Handler
export class MNLZ5Handler extends TMNLZHandler {
  constructor() {
    super()
    this.api = "GetMNLZ5LostIdles"
  }

  findProfile(lcr: LostCastResponse): any {
    return mnlz5Config.find(profile => profile.width === lcr.width && profile.thickness === lcr.thickness) || mnlz5Config[0]
  }

  findDensity(lcr: LostCastResponse): number {
    return 7800
  }
}

