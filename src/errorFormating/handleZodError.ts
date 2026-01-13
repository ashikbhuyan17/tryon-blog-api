import { ZodError } from 'zod'
import { IErrorResponse } from '../interface/common'
import { IErrorMessage } from '../interface/error'
export const handleZodError = (err: ZodError): IErrorResponse => {
  const errors: IErrorMessage[] = err.issues.map(issue => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }
  })
  return {
    statusCode: 500,
    message: 'Zod Error',
    errorMessage: errors,
  }
}
