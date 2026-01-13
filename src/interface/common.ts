import { IErrorMessage } from './error'

export type IErrorResponse = {
  statusCode: number
  message: string
  errorMessage: IErrorMessage[]
}
