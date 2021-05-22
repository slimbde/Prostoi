import { IdleSet } from "../types/gant";
import { Usage } from "../types/stats";
import { LostCastResponse } from "./DbHandler";

export interface IDbHandler {
  /**
   * retrieves shops list from the database
   */
  getShopsAsync(): Promise<string[]>


  /**
   * retrieves MNLZ idles from the database
   * @param api MNLZ api name
   * @param bDate start date
   * @param eDate end date
   */
  getMnlzIdlesAsync(api: string, bDate: string, eDate: string): Promise<LostCastResponse[]>


  /**
   * retrieves gant idles from the database
   * @param bDate start date
   * @param eDate end date
   * @param ceh shop name
   */
  getGantIdlesAsync(bDate: string, eDate: string, ceh: string): Promise<IdleSet>


  /**
   * retrieves attended users unique IP list from the database
   */
  getUsageIpsAsync(): Promise<string[]>


  /**
   * retrieves usage entries corresponding to the params provided from the database
   * @param bDate start date
   * @param eDate end date
   * @param ip the user IP
   */
  getUsageForAsync(bDate: string, eDate: string, ip: string): Promise<Usage[]>
}