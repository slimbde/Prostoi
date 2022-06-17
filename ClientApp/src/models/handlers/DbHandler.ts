import { IdleSet } from "../types/gant"
import { Usage } from "../types/stats"
import { IDbHandler } from "./IDbHandler"
import { TCacher } from "./TCacher"
import "isomorphic-fetch"
import 'promise-polyfill/src/polyfill'
import 'abortcontroller-polyfill'
import { LostSteel } from "../types/lostSteel"


class DbHandler extends TCacher implements IDbHandler {
  private static instance: IDbHandler

  static GetInstance() {
    !this.instance && (this.instance = new DbHandler())
    return this.instance
  }



  public async getShopsAsync(): Promise<string[]> {
    const key = this.GetKeyFor("getShopsAsync")
    if (this.cache.has(key)) return this.cache.get(key)

    const resp = await fetch(`api/idle/getshops`)
    if (!resp.ok)
      throw new Error("Не могу получить список цехов... Попробуйте обновить страницу")

    const res = await (resp.json() as Promise<string[]>)
    this.cache.set(key, res)
    return res
  }

  public async getCcmLostSteelAsync(bDate: string, eDate: string, ccmNo: number): Promise<LostSteel[]> {
    const key = this.GetKeyFor(`getCcmLostSteelAsync${bDate}${eDate}${ccmNo}`)
    if (this.cache.has(key)) return this.cache.get(key)

    const resp = await fetch(`api/Idle/GetCcmIdleDowntimeWeight?bDate=${bDate}&eDate=${eDate}&ccmNo=${ccmNo}`)
    if (!resp.ok)
      throw new Error(await resp.text())

    const res = await (resp.json() as Promise<LostSteel[]>)
    this.cache.set(key, res)
    return res
  }

  public async getGantIdlesAsync(bDate: string, eDate: string, ceh: string): Promise<IdleSet> {
    const key = this.GetKeyFor(`getGantIdlesAsync${bDate}${eDate}${ceh}`)
    if (this.cache.has(key)) return this.cache.get(key)

    const resp = await fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${encodeURIComponent(ceh)}`)
    if (!resp.ok) {
      if ((await resp.text()).includes(`contains no element`))
        throw new Error(`Нет простоев для ${ceh} за ${bDate} ... ${eDate}`)

      throw new Error("Не могу получить список простоев для Ганта")
    }

    const res = await (resp.json() as Promise<IdleSet>)
    this.cache.set(key, res)
    return res
  }

  public async getUsageIpsAsync(): Promise<string[]> {
    const key = this.GetKeyFor("getUsageIpsAsync")
    if (this.cache.has(key)) return this.cache.get(key)

    const resp = await fetch(`api/usage/GetUsageIps`)
    if (!resp.ok)
      throw new Error("Не могу получить список Ip")

    const res = await (resp.json() as Promise<string[]>)
    this.cache.set(key, res)
    return res
  }

  public async getUsageForAsync(bDate: string, eDate: string, ip: string): Promise<Usage[]> {
    const key = this.GetKeyFor(`getUsageForAsync${bDate}${eDate}${ip}`)
    if (this.cache.has(key)) return this.cache.get(key)

    const resp = await fetch(`api/usage/GetUsageFor?bDate=${bDate}&eDate=${eDate}&ip=${encodeURIComponent(ip)}`)
    if (!resp.ok)
      throw new Error("Нет посещений по указанным параметрам")

    const res = await (resp.json() as Promise<Usage[]>)
    this.cache.set(key, res)
    return res
  }
}


export default DbHandler.GetInstance()
