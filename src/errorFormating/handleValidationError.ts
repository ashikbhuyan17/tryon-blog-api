import mongoose from 'mongoose'
import { IErrorMessage } from '../interface/error'
import { IErrorResponse } from '../interface/common'

export const handleValidationError = (
  err: mongoose.Error.ValidationError
): IErrorResponse => {
  const errors: IErrorMessage[] = Object.values(err.errors).map(el => {
    return {
      path: el?.path,
      message: el?.message,
    }
  })

  return {
    statusCode: 500,
    message: 'Validation Error',
    errorMessage: errors,
  }
}
