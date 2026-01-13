import express from 'express'
import { registerUser, loginUser, getProfile } from './user.controller'
import reqValidate from '../../../middleware/reqValidate'
import { registerZod, loginZod } from './user.validation'
import { auth } from '../../../middleware/auth'

const router = express.Router()

// Public routes
router.post('/register', reqValidate(registerZod), registerUser)
router.post('/login', reqValidate(loginZod), loginUser)

// Protected routes (require authentication)
router.get('/profile', auth, getProfile)

export default router
