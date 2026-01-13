import { Response } from 'express'
import { IApiRes } from '../interface/apiRes'

export const sendRes = <T>(res: Response, data: IApiRes<T>): void => {
  const resData: IApiRes<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    result: data.result || null,
  }
  res.status(data.statusCode).send(resData)
}
