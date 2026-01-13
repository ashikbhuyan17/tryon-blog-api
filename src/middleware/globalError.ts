/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
import { ErrorRequestHandler } from 'express'
import config from '../config'
import { IErrorMessage } from '../interface/error'
import { handleValidationError } from '../errorFormating/handleValidationError'
import { ApiError } from '../errorFormating/apiError'
import { errorLogger } from '../utilities/logger'
import { ZodError } from 'zod'
import { handleZodError } from '../errorFormating/handleZodError'

export const globarError: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 400
  let message = 'Something went wrong'
  let errorMessage: IErrorMessage[] = []

  // Dependency
  config.env === 'development'
    ? console.log(`Global Error Handler ==`, error)
    : errorLogger.error(`Global Error Handler ==`, error)

  // Check for PayloadTooLargeError (request entity too large)
  if (
    error?.type === 'entity.too.large' ||
    error?.name === 'PayloadTooLargeError'
  ) {
    statusCode = 413 // Request Entity Too Large
    message =
      'Request payload too large. Image size limit is 1MB. Please compress or resize your image before uploading.'
    errorMessage = [
      {
        path: 'body.image',
        message:
          'Image base64 string is too large. Maximum size is 1MB. Please compress or resize your image.',
      },
    ]
  } else if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessage = simplifiedError.errorMessage
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessage = simplifiedError.errorMessage
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode
    message = error?.message
    errorMessage = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : []
  } else if (error instanceof Error) {
    message = error?.message
    errorMessage = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : []
  }

  // Return Response
  res.status(statusCode).send({
    success: false,
    message,
    errorMessage,
    stack: config.env !== 'production' ? error?.stack : undefined,
  })
}
