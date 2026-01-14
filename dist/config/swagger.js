"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Blog API Documentation',
        version: '1.0.0',
        description: `
# Blog API - Comprehensive REST API Documentation

A production-ready REST API built with Node.js, Express, TypeScript, and MongoDB for managing blogs and user authentication.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- 📝 **Blog Management**: Full CRUD operations for blog posts
- 🏷️ **Category System**: Organize blogs with predefined categories
- 👥 **User Management**: Admin can manage all users
- 🔒 **Role-Based Access**: Admin and user roles with proper authorization
- 📄 **Pagination**: Efficient pagination for list endpoints
- ✅ **Input Validation**: Comprehensive validation using Zod schemas

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Base URL

\`\`\`
http://localhost:5000/api/v1
\`\`\`

## Response Format

All API responses follow a consistent structure:

\`\`\`json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "result": { ... }
}
\`\`\`

## Error Format

Error responses follow this structure:

\`\`\`json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errorMessage": [
    {
      "path": "fieldName",
      "message": "Error description"
    }
  ]
}
\`\`\`
    `,
        contact: {
            name: 'API Support',
            email: 'support@example.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: 'http://localhost:5000/api/v1',
            description: 'Development server',
        },
        {
            url: 'https://api.example.com/api/v1',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token obtained from login endpoint',
            },
        },
        schemas: {
            // Common Response Schemas
            ApiResponse: {
                type: 'object',
                properties: {
                    statusCode: {
                        type: 'integer',
                        description: 'HTTP status code',
                        example: 200,
                    },
                    success: {
                        type: 'boolean',
                        description: 'Indicates if the request was successful',
                        example: true,
                    },
                    message: {
                        type: 'string',
                        nullable: true,
                        description: 'Response message',
                        example: 'Operation successful',
                    },
                    result: {
                        description: 'Response data (varies by endpoint)',
                    },
                },
                required: ['statusCode', 'success'],
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    statusCode: {
                        type: 'integer',
                        description: 'HTTP status code',
                        example: 400,
                    },
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Validation failed',
                    },
                    errorMessage: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                path: {
                                    type: 'string',
                                    description: 'Field path where error occurred',
                                    example: 'phone',
                                },
                                message: {
                                    type: 'string',
                                    description: 'Error description',
                                    example: 'Phone must be exactly 11 digits',
                                },
                            },
                        },
                    },
                },
                required: ['statusCode', 'success', 'message'],
            },
            // User Schemas
            User: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'MongoDB ObjectId',
                        example: '507f1f77bcf86cd799439011',
                    },
                    id: {
                        type: 'string',
                        description: 'Custom user ID',
                        example: '00001',
                    },
                    name: {
                        type: 'string',
                        description: 'User full name',
                        example: 'John Doe',
                    },
                    phone: {
                        type: 'string',
                        description: 'User phone number (11 digits)',
                        example: '01234567890',
                    },
                    role: {
                        type: 'string',
                        enum: ['admin', 'user'],
                        description: 'User role',
                        example: 'admin',
                    },
                    userType: {
                        type: 'string',
                        enum: ['reserveit'],
                        description: 'User type (must be reserveit)',
                        example: 'reserveit',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Account creation timestamp',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                    },
                },
                required: ['name', 'phone', 'role', 'userType'],
            },
            RegisterUserRequest: {
                type: 'object',
                required: ['name', 'phone', 'password', 'role', 'userType'],
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                        description: 'User full name',
                        example: 'John Doe',
                    },
                    phone: {
                        type: 'string',
                        pattern: '^\\d{11}$',
                        description: 'Phone number (exactly 11 digits)',
                        example: '01234567890',
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        description: 'Password (minimum 6 characters)',
                        example: 'password123',
                    },
                    role: {
                        type: 'string',
                        enum: ['admin', 'user'],
                        description: 'User role',
                        example: 'admin',
                    },
                    userType: {
                        type: 'string',
                        enum: ['reserveit'],
                        description: 'User type (must be reserveit)',
                        example: 'reserveit',
                    },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['phone', 'password', 'userType'],
                properties: {
                    phone: {
                        type: 'string',
                        pattern: '^\\d{11}$',
                        description: 'Phone number (exactly 11 digits)',
                        example: '01234567890',
                    },
                    password: {
                        type: 'string',
                        description: 'User password',
                        example: 'password123',
                    },
                    userType: {
                        type: 'string',
                        enum: ['reserveit'],
                        description: 'User type (must be reserveit)',
                        example: 'reserveit',
                    },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    accessToken: {
                        type: 'string',
                        description: 'JWT access token',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAxIiwicGhvbmUiOiIwMTIzNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiIsInVzZXJUeXBlIjoicmVzZXJ2ZWl0IiwiaWF0IjoxNzM1MjM0NTY3LCJleHAiOjE3MzUyMzgxNjd9',
                    },
                    user: {
                        $ref: '#/components/schemas/User',
                    },
                },
                required: ['accessToken', 'user'],
            },
            // Blog Schemas
            Blog: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'MongoDB ObjectId',
                        example: '507f1f77bcf86cd799439011',
                    },
                    title: {
                        type: 'string',
                        maxLength: 200,
                        description: 'Blog title',
                        example: 'My First Blog Post',
                    },
                    description: {
                        type: 'string',
                        description: 'Blog content/description',
                        example: 'This is the content of my blog post...',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'published'],
                        description: 'Blog publication status',
                        example: 'published',
                    },
                    category: {
                        type: 'string',
                        nullable: true,
                        enum: [
                            'Featured',
                            'Announcement',
                            'Event',
                            'Reminder',
                            'News',
                            'Alert',
                            'Notification',
                            null,
                        ],
                        description: 'Blog category/tag',
                        example: 'News',
                    },
                    author: {
                        oneOf: [
                            {
                                type: 'string',
                                description: 'Author ObjectId',
                            },
                            {
                                $ref: '#/components/schemas/User',
                                description: 'Populated author object',
                            },
                        ],
                    },
                    publishedAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        description: 'Publication date (set when status changes to published)',
                    },
                    image: {
                        type: 'string',
                        nullable: true,
                        description: 'Base64 encoded image (max 1MB)',
                        example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                    },
                },
                required: ['title', 'description', 'status'],
            },
            CreateBlogRequest: {
                type: 'object',
                required: ['title', 'description', 'status'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        description: 'Blog title',
                        example: 'My First Blog Post',
                    },
                    description: {
                        type: 'string',
                        minLength: 1,
                        description: 'Blog content/description',
                        example: 'This is the content of my blog post...',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'published'],
                        description: 'Blog publication status',
                        example: 'draft',
                    },
                    category: {
                        type: 'string',
                        nullable: true,
                        enum: [
                            'Featured',
                            'Announcement',
                            'Event',
                            'Reminder',
                            'News',
                            'Alert',
                            'Notification',
                            null,
                        ],
                        description: 'Blog category (optional)',
                        example: 'News',
                    },
                    image: {
                        type: 'string',
                        nullable: true,
                        description: 'Base64 encoded image (max 1MB). Format: data:image/{type};base64,{data}',
                        example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
                    },
                },
            },
            UpdateBlogRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        description: 'Blog title',
                        example: 'Updated Blog Title',
                    },
                    description: {
                        type: 'string',
                        minLength: 1,
                        description: 'Blog content/description',
                        example: 'Updated content...',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'published'],
                        description: 'Blog publication status',
                        example: 'published',
                    },
                    category: {
                        type: 'string',
                        nullable: true,
                        enum: [
                            'Featured',
                            'Announcement',
                            'Event',
                            'Reminder',
                            'News',
                            'Alert',
                            'Notification',
                            null,
                        ],
                        description: 'Blog category',
                        example: 'Featured',
                    },
                    image: {
                        type: 'string',
                        nullable: true,
                        description: 'Base64 encoded image (max 1MB)',
                        example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
                    },
                },
            },
            PaginatedBlogs: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Blog',
                        },
                    },
                    total: {
                        type: 'integer',
                        description: 'Total number of blogs',
                        example: 25,
                    },
                    page: {
                        type: 'integer',
                        description: 'Current page number',
                        example: 1,
                    },
                    limit: {
                        type: 'integer',
                        description: 'Items per page',
                        example: 10,
                    },
                    totalPages: {
                        type: 'integer',
                        description: 'Total number of pages',
                        example: 3,
                    },
                },
                required: ['data', 'total', 'page', 'limit', 'totalPages'],
            },
            PaginatedUsers: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/User',
                        },
                    },
                    total: {
                        type: 'integer',
                        description: 'Total number of users',
                        example: 50,
                    },
                    page: {
                        type: 'integer',
                        description: 'Current page number',
                        example: 1,
                    },
                    limit: {
                        type: 'integer',
                        description: 'Items per page',
                        example: 10,
                    },
                    totalPages: {
                        type: 'integer',
                        description: 'Total number of pages',
                        example: 5,
                    },
                },
                required: ['data', 'total', 'page', 'limit', 'totalPages'],
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                        description: 'User full name',
                        example: 'Updated Name',
                    },
                    phone: {
                        type: 'string',
                        pattern: '^\\d{11}$',
                        description: 'Phone number (exactly 11 digits)',
                        example: '01234567890',
                    },
                    role: {
                        type: 'string',
                        enum: ['admin', 'user'],
                        description: 'User role',
                        example: 'admin',
                    },
                },
            },
        },
    },
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and registration endpoints',
        },
        {
            name: 'User',
            description: 'User profile and management endpoints',
        },
        {
            name: 'Blog',
            description: 'Blog CRUD operations',
        },
        {
            name: 'Admin',
            description: 'Admin-only endpoints for user management',
        },
    ],
};
const options = {
    definition: swaggerDefinition,
    apis: [
        './src/docs/swagger.ts', // Swagger documentation file
        './src/app/modules/**/*.route.ts', // Route files (if using JSDoc comments)
        './src/app/modules/**/*.controller.ts', // Controller files (if using JSDoc comments)
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
