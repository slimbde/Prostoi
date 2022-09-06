export const SET_ERROR = (state: any, action: any) => {
  state.loading = false
  state.error = action.error
}

export const SET_LOADING = (state: any) => { state.loading = true }


export const currentBackend = () => process.env.NODE_ENV === "development"
  ? "http://localhost:5000"
  : "http://10.2.6.118:90"
