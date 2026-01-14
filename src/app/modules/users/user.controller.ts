import { Request, Response } from 'express'
import {
  createUserService,
  registerUserService,
  loginUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  UserPaginationOptions,
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
  const { phone, password, userType } = req.body
  const result = await loginUserService(phone, password, userType)
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
    {
      _id: 1,
      id: 1,
      name: 1,
      phone: 1,
      role: 1,
      userType: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  )
  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User profile retrieved successfully',
    result: user,
  })
})

// Admin User Management Controllers

/**
 * Get All Users Controller (Admin only)
 * Returns paginated list of all users
 */
export const getAllUsers = tryCatch(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const options: UserPaginationOptions = {
    page,
    limit,
  }

  const result = await getAllUsersService(options)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Users retrieved successfully',
    result: result,
  })
})

/**
 * Get User by ID Controller (Admin only)
 */
export const getUserById = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await getUserByIdService(id)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User retrieved successfully',
    result: result,
  })
})

/**
 * Update User Controller (Admin only)
 * Admin can update any user's name, phone, or role
 */
export const updateUser = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await updateUserService(id, req.body)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User updated successfully',
    result: result,
  })
})

/**
 * Delete User Controller (Admin only)
 * Admin can delete any user
 */
export const deleteUser = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  await deleteUserService(id)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User deleted successfully',
    result: null,
  })
})
