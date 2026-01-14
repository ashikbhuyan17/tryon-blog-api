import { Request, Response } from 'express'
import {
  createBlogService,
  getAllPublishedBlogsService,
  getMyBlogsService,
  getBlogByIdService,
  updateBlogService,
  deleteBlogService,
  PaginationOptions,
} from './blog.services'
import { BlogCategory } from './blog.interface'
import { sendRes } from '../../../utilities/sendRes'
import { tryCatch } from '../../../utilities/tryCatch'
import status from 'http-status'

/**
 * Create Blog Controller
 * Requires authentication (auth middleware)
 */
export const createBlog = tryCatch(async (req: Request, res: Response) => {
  // req.user is set by auth middleware
  const authorMongoId = req.user?._id

  if (!authorMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to create a blog',
      result: null,
    })
  }

  const result = await createBlogService(req.body, authorMongoId)

  sendRes(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Blog created successfully',
    result: result,
  })
})

/**
 * Get All Blogs Controller
 * Public endpoint - no authentication required
 * Supports pagination, status filtering, and category filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (default: "published")
 *   - category: Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification
 * Note: Query params are validated and transformed by paginationZod middleware
 */
export const getAllPublishedBlogs = tryCatch(
  async (req: Request, res: Response) => {
    // Query params are already validated and transformed by paginationZod
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const statusFilter = req.query.status as 'draft' | 'published' | undefined
    const categoryFilter = req.query.category as BlogCategory | undefined

    const options: PaginationOptions = {
      page,
      limit,
      status: statusFilter,
      category: categoryFilter,
    }

    const result = await getAllPublishedBlogsService(options)

    let message = 'Blogs retrieved successfully'
    if (statusFilter && categoryFilter) {
      message = `${statusFilter} ${categoryFilter} blogs retrieved successfully`
    } else if (statusFilter) {
      message = `${statusFilter} blogs retrieved successfully`
    } else if (categoryFilter) {
      message = `${categoryFilter} blogs retrieved successfully`
    } else {
      message = 'Published blogs retrieved successfully'
    }

    sendRes(res, {
      statusCode: status.OK,
      success: true,
      message: message,
      result: result,
    })
  },
)

/**
 * Get My Blogs Controller
 * Requires authentication
 * Returns all blogs by the authenticated user
 * Supports pagination, status filtering, and category filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (optional)
 *   - category: Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification (optional)
 * Note: Query params are validated and transformed by paginationZod middleware
 */
export const getMyBlogs = tryCatch(async (req: Request, res: Response) => {
  const authorMongoId = req.user?._id

  if (!authorMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to view your blogs',
      result: null,
    })
  }

  // Query params are already validated and transformed by paginationZod
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const statusFilter = req.query.status as 'draft' | 'published' | undefined
  const categoryFilter = req.query.category as BlogCategory | undefined

  const options: PaginationOptions = {
    page,
    limit,
    status: statusFilter,
    category: categoryFilter,
  }

  const result = await getMyBlogsService(authorMongoId, options)

  let message = 'Your blogs retrieved successfully'
  if (statusFilter && categoryFilter) {
    message = `Your ${statusFilter} ${categoryFilter} blogs retrieved successfully`
  } else if (statusFilter) {
    message = `Your ${statusFilter} blogs retrieved successfully`
  } else if (categoryFilter) {
    message = `Your ${categoryFilter} blogs retrieved successfully`
  }

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: message,
    result: result,
  })
})

/**
 * Get Blog by ID Controller
 * Public for published blogs, requires ownership for draft blogs
 */
export const getBlogById = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const userMongoId = req.user?._id // Optional - only needed for draft blogs

  const result = await getBlogByIdService(id, userMongoId)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Blog retrieved successfully',
    result: result,
  })
})

/**
 * Update Blog Controller
 * Requires authentication and ownership (or admin role)
 */
export const updateBlog = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const userMongoId = req.user?._id
  const userRole = req.user?.role

  if (!userMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to update a blog',
      result: null,
    })
  }

  const result = await updateBlogService(id, req.body, userMongoId, userRole)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Blog updated successfully',
    result: result,
  })
})

/**
 * Delete Blog Controller
 * Requires authentication and ownership (or admin role)
 */
export const deleteBlog = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const userMongoId = req.user?._id
  const userRole = req.user?.role

  if (!userMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to delete a blog',
      result: null,
    })
  }

  await deleteBlogService(id, userMongoId, userRole)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Blog deleted successfully',
    result: null,
  })
})
