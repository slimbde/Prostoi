import { IdleSet } from "../types/gant"

class DbHandler {

  public async getShopsAsync(): Promise<string[]> {
    const resp = await fetch(`api/idle/getshops`)
    if (resp.ok)
      return await (resp.json() as Promise<string[]>)
    throw new Error("Не могу получить список цехов... Попробуйте обновить страницу")
  }

  public async getMnlzIdlesAsync(api: string, bDate: string, eDate: string): Promise<LostCastResponse[]> {
    const resp = await fetch(`api/Idle/${api}?bDate=${bDate}&eDate=${eDate}`)
    if (resp.ok)
      return await (resp.json() as Promise<LostCastResponse[]>)
    throw new Error("Не могу получить список простоев по МНЛЗ")
  }

  public async getGantIdlesAsync(bDate: string, eDate: string, ceh: string): Promise<IdleSet> {
    const resp = await fetch(`api/Idle/GetIdles?bDate=${bDate}&eDate=${eDate}&ceh=${ceh}`)
    if (resp.ok)
      return await (resp.json() as Promise<IdleSet>)
    throw new Error("Не могу получить список простоев для Ганта")
  }
}


export const dbHandler = new DbHandler()



export type LostCastResponse = {
  day: string,
  mark: string,
  pid: string,
  profile: string,
  width: number,
  thickness: number,
  count: number,
  undercastLength: number,
  undercastWidth: number,
  undercastThickness: number,
}