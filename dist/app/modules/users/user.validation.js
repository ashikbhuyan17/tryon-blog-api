"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userZod = exports.loginZod = exports.registerZod = void 0;
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
        role: zod_1.z
            .string({
            required_error: 'Role is required',
        })
            .refine(val => val === 'reserveit', {
            message: 'Only "reserveit" role is allowed for registration',
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
