import config from '../../../config'
import { IUser } from './user.interface'
import { User } from './user.model'
import { generateUserId } from './user.utils'
import { ApiError } from '../../../errorFormating/apiError'
import status from 'http-status'
import jwt from 'jsonwebtoken'

// Registration service
export const registerUserService = async (
  data: Pick<IUser, 'name' | 'phone' | 'password' | 'role'>,
): Promise<Partial<IUser>> => {
  // Check if role is "reserveit" - only reserveit role allowed
  if (data.role !== 'reserveit') {
    throw new ApiError(
      status.FORBIDDEN,
      'Only "reserveit" role is allowed for registration',
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
    role: 'reserveit', // Force reserveit role
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
): Promise<{ accessToken: string; user: Partial<IUser> }> => {
  // Check if user exists
  const user = await User.isUserExist(phone)
  if (!user) {
    throw new ApiError(status.UNAUTHORIZED, 'Invalid phone or password')
  }

  // Check if user has "reserveit" role - only reserveit role allowed to login
  if (user.role !== 'reserveit') {
    throw new ApiError(
      status.FORBIDDEN,
      'Access denied. Only "reserveit" role users can login',
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
