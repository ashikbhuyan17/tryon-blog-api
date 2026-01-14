import { z } from 'zod'

// Base64 image validation helper
const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/

// Create blog validation schema
export const createBlogZod = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .min(1, 'Description cannot be empty')
      .trim(),
    status: z.enum(['draft', 'published']),
    category: z
      .enum(
        [
          'Featured',
          'Announcement',
          'Event',
          'Reminder',
          'News',
          'Alert',
          'Notification',
        ],
        {
          invalid_type_error:
            'Category must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification',
        },
      )
      .nullable()
      .optional(),
    image: z
      .string()
      .optional()
      .refine(
        val => {
          // If image is provided, validate base64 format
          if (!val) return true // Optional field

          // Check if it's a valid base64 image format
          if (!base64ImageRegex.test(val)) {
            return false
          }

          // Check size limit (1MB = ~1,342,177 base64 characters)
          // Base64 encoding increases size by ~33%, so 1MB file ≈ 1.33MB base64
          const maxBase64Size = 1.4 * 1024 * 1024 // ~1.4MB in characters (safety margin)
          if (val.length > maxBase64Size) {
            return false
          }

          return true
        },
        {
          message:
            'Image must be a valid base64 encoded image (data:image/...;base64,...) and must not exceed 1MB',
        },
      ),
  }),
})

// Update blog validation schema
export const updateBlogZod = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .trim()
      .optional(),
    status: z.enum(['draft', 'published']).optional(),
    category: z
      .enum(
        [
          'Featured',
          'Announcement',
          'Event',
          'Reminder',
          'News',
          'Alert',
          'Notification',
        ],
        {
          invalid_type_error:
            'Category must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification',
        },
      )
      .nullable()
      .optional(),
    image: z
      .string()
      .optional()
      .refine(
        val => {
          if (!val) return true // Optional field

          // Check if it's a valid base64 image format
          if (!base64ImageRegex.test(val)) {
            return false
          }

          // Check size limit (1MB = ~1,342,177 base64 characters)
          // Base64 encoding increases size by ~33%, so 1MB file ≈ 1.33MB base64
          const maxBase64Size = 1.4 * 1024 * 1024 // ~1.4MB in characters (safety margin)
          if (val.length > maxBase64Size) {
            return false
          }

          return true
        },
        {
          message:
            'Image must be a valid base64 encoded image (data:image/...;base64,...) and must not exceed 1MB',
        },
      ),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Blog ID is required',
    }),
  }),
})

// Get blog by ID validation
export const getBlogByIdZod = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Blog ID is required',
    }),
  }),
})

// Pagination query validation
export const paginationZod = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 1))
      .refine(val => val > 0, { message: 'Page must be greater than 0' }),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 10))
      .refine(val => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      }),
    status: z.enum(['draft', 'published']).optional(),
    category: z
      .enum(
        [
          'Featured',
          'Announcement',
          'Event',
          'Reminder',
          'News',
          'Alert',
          'Notification',
        ],
        {
          invalid_type_error:
            'Category must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification',
        },
      )
      .optional(),
  }),
})
