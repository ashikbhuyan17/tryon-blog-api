import express from 'express'
import {
  createBlog,
  getAllPublishedBlogs,
  getMyBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from './blog.controller'
import reqValidate from '../../../middleware/reqValidate'
import {
  createBlogZod,
  updateBlogZod,
  getBlogByIdZod,
  paginationZod,
} from './blog.validation'
import { auth } from '../../../middleware/auth'

const router = express.Router()

// Protected routes (require authentication) - MUST come before /:id routes
router.post('/', auth, reqValidate(createBlogZod), createBlog) // Create blog
router.get('/my/blogs', auth, reqValidate(paginationZod), getMyBlogs) // Get my blogs

// Public routes (no authentication required)
router.get('/', reqValidate(paginationZod), getAllPublishedBlogs) // Get all published blogs
router.get('/:id', reqValidate(getBlogByIdZod), getBlogById) // Get single blog by ID

// Protected routes with ID (require authentication)
router.patch('/:id', auth, reqValidate(updateBlogZod), updateBlog) // Update blog
router.delete('/:id', auth, reqValidate(getBlogByIdZod), deleteBlog) // Delete blog

export default router
