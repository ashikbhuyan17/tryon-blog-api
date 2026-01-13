import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'

const reqValidate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse and validate - this also applies transforms
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })

      // Assign transformed values back to request object
      // This ensures transformed query params (like page/limit) are available
      if (validatedData.query) {
        req.query = validatedData.query as typeof req.query
      }
      if (validatedData.body) {
        req.body = validatedData.body
      }
      if (validatedData.params) {
        req.params = validatedData.params
      }

      return next()
    } catch (error) {
      next(error)
    }
  }

export default reqValidate
