export type Idle = {
  ceh: string
  agreg: string
  beginDate: Date
  endDate: Date
  duration: number
  culprit: string
  fullBeginDate: string
  fullEndDate: string
  proiz: number
}

export type Ceh = {
  [key: string]: Idle[]
}

export type IdleSet = {
  [key: string]: Ceh
}