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
 * Supports pagination and status filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (default: "published")
 * Note: Query params are validated and transformed by paginationZod middleware
 */
export const getAllPublishedBlogs = tryCatch(
  async (req: Request, res: Response) => {
    // Query params are already validated and transformed by paginationZod
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const statusFilter = req.query.status as 'draft' | 'published' | undefined

    const options: PaginationOptions = {
      page,
      limit,
      status: statusFilter,
    }

    const result = await getAllPublishedBlogsService(options)

    const statusMessage = statusFilter
      ? `${statusFilter} blogs`
      : 'published blogs'

    sendRes(res, {
      statusCode: status.OK,
      success: true,
      message: `${statusMessage} retrieved successfully`,
      result: result,
    })
  },
)

/**
 * Get My Blogs Controller
 * Requires authentication
 * Returns all blogs by the authenticated user
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

  const options: PaginationOptions = {
    page,
    limit,
  }

  const result = await getMyBlogsService(authorMongoId, options)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Your blogs retrieved successfully',
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
 * Requires authentication and ownership
 */
export const updateBlog = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const userMongoId = req.user?._id

  if (!userMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to update a blog',
      result: null,
    })
  }

  const result = await updateBlogService(id, req.body, userMongoId)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Blog updated successfully',
    result: result,
  })
})

/**
 * Delete Blog Controller
 * Requires authentication and ownership
 */
export const deleteBlog = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const userMongoId = req.user?._id

  if (!userMongoId) {
    return sendRes(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: 'You must be logged in to delete a blog',
      result: null,
    })
  }

  await deleteBlogService(id, userMongoId)

  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'Blog deleted successfully',
    result: null,
  })
})
