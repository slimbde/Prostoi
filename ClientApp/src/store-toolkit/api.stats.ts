import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { Usage } from "models/types/stats"
import { currentBackend } from "./utils"



export const statsApi = createApi({
  reducerPath: "api/usage",
  baseQuery: fetchBaseQuery({
    baseUrl: `${currentBackend()}/api/Usage/`
  }),
  endpoints: build => ({

    GetUsageIps: build.query<string[], void>({
      query: () => "GetUsageIps",
      transformResponse: (resp: string[]) => resp.sort((a, b) => {
        const a1 = a.replace(/\./g, "")
        const b1 = b.replace(/\./g, "")

        return a1 < b1 ? -1 : a1 > b1 ? 1 : 0
      })
    }),

    GetUsageFor: build.query<Usage[], { bDate: string, eDate: string, ip: string }>({
      query: ({ bDate, eDate, ip }) => ({
        url: "GetUsageFor",
        params: {
          bDate,
          eDate,
          ip,
        }
      }),
    }),

  }),

  refetchOnFocus: false,
})


export const {
  useGetUsageIpsQuery,
  useLazyGetUsageForQuery,
} = statsApi
