export const SET_ERROR = (state: any, action: any) => {
  state.loading = false
  state.error = action.error
}

export const SET_LOADING = (state: any) => { state.loading = true }