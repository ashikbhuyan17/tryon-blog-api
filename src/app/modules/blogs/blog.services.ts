import { Types } from 'mongoose'
import { IBlog, BlogCategory } from './blog.interface'
import { Blog } from './blog.model'
import { ApiError } from '../../../errorFormating/apiError'
import status from 'http-status'

// Pagination interface
export interface PaginationOptions {
  page: number
  limit: number
  status?: 'draft' | 'published'
  category?: BlogCategory
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Helper function to ensure category field is always present (null if not set)
 * Mongoose .lean() omits null fields, so we need to explicitly add them
 */
const ensureCategoryField = (blog: any): IBlog => {
  return {
    ...blog,
    category: blog.category ?? null,
  } as IBlog
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
    // Ensure category is null if not provided
    category: data.category ?? null,
  }

  const result = await Blog.create(blogData)

  // Populate author info
  await result.populate('author', 'name phone id _id')

  // Convert to plain object and ensure category is present
  const blogObj = result.toObject()
  return ensureCategoryField(blogObj)
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
  const { page, limit, status, category } = options
  const skip = (page - 1) * limit

  // Build query filter - default to 'published' if no status specified
  const filter: {
    status: 'draft' | 'published'
    category?: BlogCategory
  } = {
    status: status || 'published',
  }

  // Add category filter if provided
  if (category) {
    filter.category = category
  }

  // Determine sort field based on status
  // Published blogs sorted by publishedAt, drafts sorted by createdAt
  const sortField = filter.status === 'published' ? 'publishedAt' : 'createdAt'

  // Get blogs based on status and category filters, sorted appropriately
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name phone role id _id')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ])

  // Ensure category field is always present (null if not set)
  const blogsWithCategory = blogs.map(ensureCategoryField)

  return {
    data: blogsWithCategory,
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
  const { page, limit, status, category } = options
  const skip = (page - 1) * limit

  // Build query filter
  const filter: {
    author: Types.ObjectId
    status?: 'draft' | 'published'
    category?: BlogCategory
  } = {
    author: new Types.ObjectId(authorMongoId),
  }

  // Add status filter if provided
  if (status) {
    filter.status = status
  }

  // Add category filter if provided
  if (category) {
    filter.category = category
  }

  // Determine sort field based on status
  const sortField = filter.status === 'published' ? 'publishedAt' : 'createdAt'

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name phone id _id')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ])

  // Ensure category field is always present (null if not set)
  const blogsWithCategory = blogs.map(ensureCategoryField)

  return {
    data: blogsWithCategory,
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

  // Ensure category field is always present (null if not set)
  const blogWithCategory = ensureCategoryField(blog)

  // If blog is published, anyone can view it
  if (blog.status === 'published') {
    return blogWithCategory
  }

  // If blog is draft, only the author can view it
  if (userMongoId && blog.author) {
    const authorMongoId =
      typeof blog.author === 'object'
        ? (blog.author as any)._id?.toString()
        : blog.author.toString()

    if (authorMongoId === userMongoId) {
      return blogWithCategory
    }
  }

  throw new ApiError(
    status.FORBIDDEN,
    'You do not have permission to view this blog',
  )
}

/**
 * Update Blog Service
 * Blog owner or admin can update
 */
export const updateBlogService = async (
  blogId: string,
  updateData: Partial<Omit<IBlog, '_id' | 'author' | 'createdAt'>>,
  userMongoId: string, // MongoDB _id
  userRole?: string, // User role ('admin' or 'user')
): Promise<IBlog> => {
  // Find blog and check ownership
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(status.NOT_FOUND, 'Blog not found')
  }

  // Check if user is the author OR admin
  const isOwner = blog.author.toString() === userMongoId
  const isAdmin = userRole === 'admin'

  if (!isOwner && !isAdmin) {
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

  // Convert to plain object and ensure category is present
  const blogObj = blog.toObject()
  return ensureCategoryField(blogObj)
}

/**
 * Delete Blog Service
 * Blog owner or admin can delete
 */
export const deleteBlogService = async (
  blogId: string,
  userMongoId: string, // MongoDB _id
  userRole?: string, // User role ('admin' or 'user')
): Promise<void> => {
  // Find blog and check ownership
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(status.NOT_FOUND, 'Blog not found')
  }

  // Check if user is the author OR admin
  const isOwner = blog.author.toString() === userMongoId
  const isAdmin = userRole === 'admin'

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      status.FORBIDDEN,
      'You do not have permission to delete this blog',
    )
  }

  // Hard delete (you can change this to soft delete by adding a deletedAt field)
  await Blog.findByIdAndDelete(blogId)
}
