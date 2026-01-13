export type IApiRes<T> = {
  statusCode: number
  success: boolean
  message?: string | null
  result?: T | null
}
