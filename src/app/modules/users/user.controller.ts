import { Request, Response } from 'express'
import {
  createUserService,
  registerUserService,
  loginUserService,
} from './user.services'
import { sendRes } from '../../../utilities/sendRes'
import { tryCatch } from '../../../utilities/tryCatch'
import status from 'http-status'
import { User } from './user.model'

/**
 * User Registration Controller
 *
 * Handles user registration:
 * - Validates input (name, phone, password)
 * - Checks if user already exists
 * - Hashes password (done in model pre-save hook)
 * - Creates user in database
 * - Returns user data (without password)
 */
export const registerUser = tryCatch(async (req: Request, res: Response) => {
  const result = await registerUserService(req.body)
  sendRes(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'User registered successfully',
    result: result,
  })
})

/**
 * User Login Controller
 *
 * Handles user login:
 * - Validates input (phone, password)
 * - Checks if user exists
 * - Compares password using bcrypt
 * - Generates JWT token
 * - Returns token and user data
 */
export const loginUser = tryCatch(async (req: Request, res: Response) => {
  const { phone, password } = req.body
  const result = await loginUserService(phone, password)
  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User logged in successfully',
    result: result,
  })
})

/**
 * Get Current User Profile
 *
 * Returns the authenticated user's profile
 * Requires auth middleware to be applied
 */
export const getProfile = tryCatch(async (req: Request, res: Response) => {
  // User info is attached by auth middleware
  // Include both _id (Mongoose default) and id (custom)
  const user = await User.findOne(
    { id: req.user?.id },
    { _id: 1, id: 1, name: 1, phone: 1, role: 1, createdAt: 1, updatedAt: 1 },
  )
  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User profile retrieved successfully',
    result: user,
  })
})

