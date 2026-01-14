import config from '../../../config'
import { IUser } from './user.interface'
import { User } from './user.model'
import { generateUserId } from './user.utils'
import { ApiError } from '../../../errorFormating/apiError'
import status from 'http-status'
import jwt from 'jsonwebtoken'

// Registration service
export const registerUserService = async (
  data: Pick<IUser, 'name' | 'phone' | 'password' | 'role' | 'userType'>,
): Promise<Partial<IUser>> => {
  // Check if userType is "reserveit" - mandatory for registration
  if (data.userType !== 'reserveit') {
    throw new ApiError(
      status.FORBIDDEN,
      'UserType must be "reserveit" for registration',
    )
  }

  // Check if user already exists
  const existingUser = await User.isUserExist(data.phone)
  if (existingUser) {
    throw new ApiError(
      status.CONFLICT,
      'User already exists with this phone number',
    )
  }

  // Generate user ID
  const id = await generateUserId()

  // Create user (password will be hashed by pre-save hook)
  // Mongoose automatically creates _id, and we also set custom id
  const userData: IUser = {
    id,
    name: data.name,
    phone: data.phone,
    password: data.password,
    role: data.role || 'user', // Default to 'user' if not provided
    userType: 'reserveit', // Force reserveit userType
  }

  const result = await User.create(userData)

  // Remove password from response
  // Include both _id (Mongoose default) and id (custom)
  const { password: _, ...userWithoutPassword } = result.toObject()

  return userWithoutPassword
}

// Login service
export const loginUserService = async (
  phone: string,
  password: string,
  userType: string,
): Promise<{ accessToken: string; user: Partial<IUser> }> => {
  if (userType !== 'reserveit') {
    throw new ApiError(
      status.FORBIDDEN,
      'UserType must be same as registration',
    )
  }
  // Check if user exists
  const user = await User.isUserExist(phone)
  if (!user) {
    throw new ApiError(status.UNAUTHORIZED, 'Invalid phone or password')
  }

  // Check if user has "reserveit" userType - mandatory for login
  if (user.userType !== 'reserveit') {
    throw new ApiError(
      status.FORBIDDEN,
      'Access denied. Only users with userType "reserveit" can login',
    )
  }

  // Check if password matches
  const isPasswordMatched = await User.isPasswordMatched(
    password,
    user.password,
  )
  if (!isPasswordMatched) {
    throw new ApiError(status.UNAUTHORIZED, 'Invalid phone or password')
  }

  // Generate JWT token
  const jwtSecret = config.jwt.secret
  if (!jwtSecret) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      'JWT secret is not configured',
    )
  }

  const payload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    userType: user.userType,
  }

  // @ts-ignore - jsonwebtoken type issue with expiresIn
  const accessToken = jwt.sign(payload, jwtSecret as string, {
    expiresIn: config.jwt.expires_in || '1h',
  })

  // Remove password from user object
  // Note: user._id is already a string from isUserExist
  const { password: _, ...userWithoutPassword } = user

  return {
    accessToken,
    user: userWithoutPassword as Partial<IUser>,
  }
}

// Keep old service for backward compatibility (if needed)
export const createUserService = async (data: IUser): Promise<IUser | null> => {
  // generated ID
  const id = await generateUserId()
  data.id = id
  // default password
  if (!data.password) {
    data.password = config.user_default_pass as string
  }
  const result = await User.create(data)
  if (!result) {
    throw new Error('User create failed')
  }
  return result
}

// Admin User Management Services

/**
 * Get All Users Service (Admin only)
 * Returns paginated list of all users
 */
export interface UserPaginationOptions {
  page: number
  limit: number
}

export interface UserPaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const getAllUsersService = async (
  options: UserPaginationOptions,
): Promise<UserPaginatedResult<Partial<IUser>>> => {
  const { page, limit } = options
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    User.find({}, { password: 0 }) // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({}),
  ])

  return {
    data: users as Partial<IUser>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get User by ID Service (Admin only)
 */
export const getUserByIdService = async (
  userId: string,
): Promise<Partial<IUser> | null> => {
  const user = await User.findById(userId, { password: 0 }).lean()

  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found')
  }

  return user as Partial<IUser>
}

/**
 * Update User Service (Admin only)
 * Admin can update any user
 */
export const updateUserService = async (
  userId: string,
  updateData: Partial<Pick<IUser, 'name' | 'phone' | 'role'>>,
): Promise<Partial<IUser>> => {
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found')
  }

  // Update allowed fields
  if (updateData.name !== undefined) {
    user.name = updateData.name
  }
  if (updateData.phone !== undefined) {
    // Check if phone already exists for another user
    const existingUser = await User.findOne({ phone: updateData.phone })
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ApiError(
        status.CONFLICT,
        'Phone number already exists for another user',
      )
    }
    user.phone = updateData.phone
  }
  if (updateData.role !== undefined) {
    user.role = updateData.role as 'admin' | 'user'
  }

  await user.save()

  // Return user without password
  const { password: _, ...userWithoutPassword } = user.toObject()
  return userWithoutPassword as Partial<IUser>
}

/**
 * Delete User Service (Admin only)
 * Admin can delete any user
 */
export const deleteUserService = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found')
  }

  await User.findByIdAndDelete(userId)
}
