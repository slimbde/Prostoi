import moment from "moment"

export class TCacher {
  protected cache: Map<string, any> = new Map()

  protected GetKeyFor(name: string): string {
    return `${name}${moment().toISOString(true).slice(0, 10)}`
  }

  ClearCache() {
    this.cache.clear()
  }
}