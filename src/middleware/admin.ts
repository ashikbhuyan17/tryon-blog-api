import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../errorFormating/apiError'
import status from 'http-status'

/**
 * Admin Middleware
 *
 * This middleware checks if the authenticated user has admin role
 * Must be used after auth middleware
 */
export const admin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated (should be set by auth middleware)
  if (!req.user) {
    return next(new ApiError(status.UNAUTHORIZED, 'You are not authorized!'))
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return next(
      new ApiError(
        status.FORBIDDEN,
        'Access denied. Admin privileges required.',
      ),
    )
  }

  // User is admin, continue to next middleware/route handler
  next()
}
