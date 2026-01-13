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
    role: z
      .string({
        required_error: 'Role is required',
      })
      .refine(val => val === 'reserveit', {
        message: 'Only "reserveit" role is allowed for registration',
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
