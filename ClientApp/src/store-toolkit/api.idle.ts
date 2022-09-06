import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { IdleSet } from "models/types/gant"
import { LostSteel } from "models/types/lostSteel"
import { currentBackend } from "./utils"



export const idleApi = createApi({
  reducerPath: "api/idle",
  baseQuery: fetchBaseQuery({
    baseUrl: `${currentBackend()}/api/Idle/`
  }),
  endpoints: build => ({

    GetShops: build.query<string[], void>({
      query: () => "GetShops",
    }),

    GetCcmLostSteel: build.query<LostSteel[], { bDate: string, eDate: string, ccmNo: number }>({
      query: ({ bDate, eDate, ccmNo }) => ({
        url: "GetCcmIdleDowntimeWeight",
        params: {
          bDate,
          eDate,
          ccmNo,
        }
      }),
      transformResponse: (rawLosts: LostSteel[]) => {
        return rawLosts.map(l => {
          const totalWeight = l.DOWNTIME_WEIGHT + l.IDLE_WEIGHT | 1;
          return ({
            ...l,
            IDLE_PERCENT: Math.round(l.IDLE_WEIGHT / totalWeight * 100),
            DOWNTIME_PERCENT: Math.round(l.DOWNTIME_WEIGHT / totalWeight * 100),
            SHIFT: l.SHIFT.slice(0, 10),
          })
        })
      }
    }),

    GetGantIdles: build.query<IdleSet, { bDate: string, eDate: string, ceh: string }>({
      query: ({ bDate, eDate, ceh }) => ({
        url: "GetIdles",
        params: {
          bDate,
          eDate,
          ceh
        }
      })
    }),


  }),

  refetchOnFocus: false,
})


export const {
  useGetShopsQuery,
  useLazyGetCcmLostSteelQuery,
  useLazyGetGantIdlesQuery,
} = idleApi
