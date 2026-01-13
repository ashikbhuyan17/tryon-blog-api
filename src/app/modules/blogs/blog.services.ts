import { Types } from 'mongoose'
import { IBlog } from './blog.interface'
import { Blog } from './blog.model'
import { ApiError } from '../../../errorFormating/apiError'
import status from 'http-status'

// Pagination interface
export interface PaginationOptions {
  page: number
  limit: number
  status?: 'draft' | 'published'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Create Blog Service
 * Only logged-in users can create blogs
 */
export const createBlogService = async (
  data: Omit<IBlog, '_id' | 'createdAt' | 'updatedAt'>,
  authorMongoId: string, // MongoDB _id (ObjectId string)
): Promise<IBlog> => {
  const blogData: IBlog = {
    ...data,
    author: new Types.ObjectId(authorMongoId),
  }

  const result = await Blog.create(blogData)

  // Populate author info
  await result.populate('author', 'name phone id _id')

  return result
}

/**
 * Get All Blogs Service
 * Supports pagination and status filtering
 * Default: shows only published blogs
 * Can filter by status: ?status=published or ?status=draft
 */
export const getAllPublishedBlogsService = async (
  options: PaginationOptions,
): Promise<PaginatedResult<IBlog>> => {
  const { page, limit, status } = options
  const skip = (page - 1) * limit

  // Build query filter - default to 'published' if no status specified
  const filter: { status: 'draft' | 'published' } = {
    status: status || 'published',
  }

  // Determine sort field based on status
  // Published blogs sorted by publishedAt, drafts sorted by createdAt
  const sortField = filter.status === 'published' ? 'publishedAt' : 'createdAt'

  // Get blogs based on status filter, sorted appropriately
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name phone id _id')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ])

  return {
    data: blogs as IBlog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get My Blogs Service
 * Returns all blogs by the authenticated user (both draft and published)
 * Supports pagination
 */
export const getMyBlogsService = async (
  authorMongoId: string, // MongoDB _id
  options: PaginationOptions,
): Promise<PaginatedResult<IBlog>> => {
  const { page, limit } = options
  const skip = (page - 1) * limit

  const [blogs, total] = await Promise.all([
    Blog.find({ author: new Types.ObjectId(authorMongoId) })
      .populate('author', 'name phone id _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments({ author: new Types.ObjectId(authorMongoId) }),
  ])

  return {
    data: blogs as IBlog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get Single Blog by ID Service
 * Users can get published blogs or their own blogs (even if draft)
 */
export const getBlogByIdService = async (
  blogId: string,
  userMongoId?: string, // MongoDB _id
): Promise<IBlog | null> => {
  const blog = await Blog.findById(blogId)
    .populate('author', 'name phone id _id')
    .lean()

  if (!blog) {
    throw new ApiError(status.NOT_FOUND, 'Blog not found')
  }

  // If blog is published, anyone can view it
  if (blog.status === 'published') {
    return blog as IBlog
  }

  // If blog is draft, only the author can view it
  if (userMongoId && blog.author) {
    const authorMongoId =
      typeof blog.author === 'object'
        ? (blog.author as any)._id?.toString()
        : blog.author.toString()

    if (authorMongoId === userMongoId) {
      return blog as IBlog
    }
  }

  throw new ApiError(
    status.FORBIDDEN,
    'You do not have permission to view this blog',
  )
}

/**
 * Update Blog Service
 * Only blog owner can update
 */
export const updateBlogService = async (
  blogId: string,
  updateData: Partial<Omit<IBlog, '_id' | 'author' | 'createdAt'>>,
  userMongoId: string, // MongoDB _id
): Promise<IBlog> => {
  // Find blog and check ownership
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(status.NOT_FOUND, 'Blog not found')
  }

  // Check if user is the author
  if (blog.author.toString() !== userMongoId) {
    throw new ApiError(
      status.FORBIDDEN,
      'You do not have permission to update this blog',
    )
  }

  // Update fields
  Object.assign(blog, updateData)

  // Save and populate author
  await blog.save()
  await blog.populate('author', 'name phone id _id')

  return blog
}

/**
 * Delete Blog Service
 * Only blog owner can delete (soft delete - sets status to deleted or removes)
 */
export const deleteBlogService = async (
  blogId: string,
  userMongoId: string, // MongoDB _id
): Promise<void> => {
  // Find blog and check ownership
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(status.NOT_FOUND, 'Blog not found')
  }

  // Check if user is the author
  if (blog.author.toString() !== userMongoId) {
    throw new ApiError(
      status.FORBIDDEN,
      'You do not have permission to delete this blog',
    )
  }

  // Hard delete (you can change this to soft delete by adding a deletedAt field)
  await Blog.findByIdAndDelete(blogId)
}
