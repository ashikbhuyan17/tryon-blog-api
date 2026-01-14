import { z } from 'zod'

// Registration validation schema
export const registerZod = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(1, 'Name cannot be empty')
      .trim(),
    phone: z
      .string({
        required_error: 'Phone is required',
      })
      .regex(/^\d{11}$/, 'Phone must be exactly 11 digits'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be either "admin" or "user"',
    }),
    userType: z
      .string({
        required_error: 'UserType is required',
      })
      .refine(val => val === 'reserveit', {
        message: 'UserType must be "reserveit"',
      }),
  }),
})

// Login validation schema
export const loginZod = z.object({
  body: z.object({
    phone: z
      .string({
        required_error: 'Phone is required',
      })
      .regex(/^\d{11}$/, 'Phone must be exactly 11 digits'),
    password: z.string({
      required_error: 'Password is required',
    }),
    userType: z
      .string({
        required_error: 'UserType is required',
      })
      .refine(val => val === 'reserveit', {
        message: 'UserType must be "reserveit"',
      }),
  }),
})

// Keep old validation for backward compatibility (if needed)
export const userZod = z.object({
  body: z.object({
    role: z.string({
      required_error: 'Z: Role is required',
    }),
    password: z.string().optional(),
  }),
})

// Admin user management validation schemas

// Get user by ID validation
export const getUserByIdZod = z.object({
  params: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
})

// Update user validation schema (Admin only)
export const updateUserZod = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').trim().optional(),
    phone: z
      .string()
      .regex(/^\d{11}$/, 'Phone must be exactly 11 digits')
      .optional(),
    role: z.enum(['admin', 'user']).optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
})

// Pagination query validation for admin user list
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
  }),
})
