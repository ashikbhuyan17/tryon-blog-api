"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationZod = exports.updateUserZod = exports.getUserByIdZod = exports.userZod = exports.loginZod = exports.registerZod = void 0;
const zod_1 = require("zod");
// Registration validation schema
exports.registerZod = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            required_error: 'Name is required',
        })
            .min(1, 'Name cannot be empty')
            .trim(),
        phone: zod_1.z
            .string({
            required_error: 'Phone is required',
        })
            .regex(/^\d{11}$/, 'Phone must be exactly 11 digits'),
        password: zod_1.z
            .string({
            required_error: 'Password is required',
        })
            .min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.enum(['admin', 'user'], {
            required_error: 'Role is required',
            invalid_type_error: 'Role must be either "admin" or "user"',
        }),
        userType: zod_1.z
            .string({
            required_error: 'UserType is required',
        })
            .refine(val => val === 'reserveit', {
            message: 'UserType must be "reserveit"',
        }),
    }),
});
// Login validation schema
exports.loginZod = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z
            .string({
            required_error: 'Phone is required',
        })
            .regex(/^\d{11}$/, 'Phone must be exactly 11 digits'),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
        userType: zod_1.z
            .string({
            required_error: 'UserType is required',
        })
            .refine(val => val === 'reserveit', {
            message: 'UserType must be "reserveit"',
        }),
    }),
});
// Keep old validation for backward compatibility (if needed)
exports.userZod = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.string({
            required_error: 'Z: Role is required',
        }),
        password: zod_1.z.string().optional(),
    }),
});
// Admin user management validation schemas
// Get user by ID validation
exports.getUserByIdZod = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({
            required_error: 'User ID is required',
        }),
    }),
});
// Update user validation schema (Admin only)
exports.updateUserZod = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name cannot be empty').trim().optional(),
        phone: zod_1.z
            .string()
            .regex(/^\d{11}$/, 'Phone must be exactly 11 digits')
            .optional(),
        role: zod_1.z.enum(['admin', 'user']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({
            required_error: 'User ID is required',
        }),
    }),
});
// Pagination query validation for admin user list
exports.paginationZod = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 1))
            .refine(val => val > 0, { message: 'Page must be greater than 0' }),
        limit: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 10))
            .refine(val => val > 0 && val <= 100, {
            message: 'Limit must be between 1 and 100',
        }),
    }),
});
