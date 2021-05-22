import { IdleSet } from "../types/gant";
import { Usage } from "../types/stats";
import { DbHandler, LostCastResponse } from "./DbHandler";
import { IDbHandler } from "./IDbHandler";


class DbProxy implements IDbHandler {
  private cache: Map<string, object>    // requests cache
  private dbHandler: IDbHandler         // dbHandler instance


  constructor() {
    this.dbHandler = new DbHandler()
    this.cache = new Map<string, object>()
  }


  /**
   * removes cache entry
   * @param key unsuccessful request to remove from cache
   */
  remove(key: string) { this.cache.delete(key) }


  async getShopsAsync(): Promise<string[]> {
    const request = `getShopsAsync`
    try {
      if (!this.cache.has(request)) {
        const result = this.dbHandler.getShopsAsync()
        this.cache.set(request, result)
      }
      return this.cache.get(request) as Promise<string[]>
    } catch (error) { throw new Error(error.message) }
  }


  async getMnlzIdlesAsync(api: string, bDate: string, eDate: string): Promise<LostCastResponse[]> {
    try {
      const request = `${api}${bDate}${eDate}`
      if (!this.cache.has(request)) {
        const result = this.dbHandler.getMnlzIdlesAsync(api, bDate, eDate)
        this.cache.set(request, result)
      }
      return this.cache.get(request) as Promise<LostCastResponse[]>
    } catch (error) { throw new Error(error.message) }
  }


  async getGantIdlesAsync(bDate: string, eDate: string, ceh: string): Promise<IdleSet> {
    try {
      const request = `${bDate}${eDate}${ceh}`
      if (!this.cache.has(request)) {
        const result = this.dbHandler.getGantIdlesAsync(bDate, eDate, ceh)
        this.cache.set(request, result)
      }
      return this.cache.get(request) as Promise<IdleSet>
    } catch (error) { throw new Error(error.message) }
  }


  async getUsageIpsAsync(): Promise<string[]> {
    try {
      const request = `getUsageIpsAsync`
      if (!this.cache.has(request)) {
        const result = this.dbHandler.getUsageIpsAsync()
        this.cache.set(request, result)
      }
      return this.cache.get(request) as Promise<string[]>
    } catch (error) { throw new Error(error.message) }
  }


  async getUsageForAsync(bDate: string, eDate: string, ip: string): Promise<Usage[]> {
    try {
      const request = `${bDate}${eDate}${ip}`
      if (!this.cache.has(request)) {
        const result = this.dbHandler.getUsageForAsync(bDate, eDate, ip)
        this.cache.set(request, result)
      }
      return this.cache.get(request) as Promise<Usage[]>
    } catch (error) { throw new Error(error.message) }
  }

}


export const dbProxy = new DbProxy()