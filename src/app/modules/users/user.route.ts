import express from 'express'
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './user.controller'
import reqValidate from '../../../middleware/reqValidate'
import {
  registerZod,
  loginZod,
  getUserByIdZod,
  updateUserZod,
  paginationZod,
} from './user.validation'
import { auth } from '../../../middleware/auth'
import { admin } from '../../../middleware/admin'

const router = express.Router()

// Public routes
router.post('/register', reqValidate(registerZod), registerUser)
router.post('/login', reqValidate(loginZod), loginUser)

// Protected routes (require authentication)
router.get('/profile', auth, getProfile)

// Admin routes (require authentication + admin role)
router.get('/admin/users', auth, admin, reqValidate(paginationZod), getAllUsers)
router.get(
  '/admin/users/:id',
  auth,
  admin,
  reqValidate(getUserByIdZod),
  getUserById,
)
router.patch(
  '/admin/users/:id',
  auth,
  admin,
  reqValidate(updateUserZod),
  updateUser,
)
router.delete(
  '/admin/users/:id',
  auth,
  admin,
  reqValidate(getUserByIdZod),
  deleteUser,
)

export default router
