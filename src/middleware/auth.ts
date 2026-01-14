import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import { ApiError } from '../errorFormating/apiError'
import status from 'http-status'
import { User } from '../app/modules/users/user.model'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        _id?: string // MongoDB _id
        phone: string
        role: string
        userType?: string
      }
    }
  }
}

/**
 * Auth Middleware
 *
 * This middleware:
 * 1. Extracts JWT token from Authorization header
 * 2. Verifies the token using JWT secret
 * 3. Finds the user in database
 * 4. Attaches user info to request object
 * 5. Returns error if token is invalid/expired or user not found
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(status.UNAUTHORIZED, 'You are not authorized!')
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new ApiError(status.UNAUTHORIZED, 'Token is missing!')
    }

    // Verify token
    // jwt.verify throws error if token is invalid or expired
    if (!config.jwt.secret) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        'JWT secret is not configured',
      )
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string
      phone: string
      role: string
      userType?: string
    }

    // Find user in database
    // Include both _id (Mongoose default) and id (custom)
    const user = await User.findOne(
      { id: decoded.id },
      { _id: 1, id: 1, phone: 1, role: 1, userType: 1, name: 1 },
    )

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, 'User not found!')
    }

    // Attach user info to request object
    // This allows route handlers to access user info via req.user
    req.user = {
      id: user.id || '',
      _id: user._id?.toString() || '',
      phone: user.phone,
      role: user.role || 'user',
      userType: user.userType || 'reserveit',
    }

    // Continue to next middleware/route handler
    next()
  } catch (error) {
    // Handle JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(status.UNAUTHORIZED, 'Invalid token!'))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(status.UNAUTHORIZED, 'Token has expired!'))
    } else {
      // Pass other errors to global error handler
      next(error)
    }
  }
}
