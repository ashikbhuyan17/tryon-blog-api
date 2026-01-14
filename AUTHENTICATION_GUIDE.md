# Secure Authentication System - Implementation Guide

## Overview
This guide explains the secure authentication system built for your Node.js/Express/MongoDB application using bcrypt for password hashing and JWT for token-based authentication.

**Key Features:**
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (`role`: "admin" or "user")
- ✅ UserType-based access control (`userType`: must be "reserveit" - mandatory)
- ✅ Dual ID system (`_id` and `id`)
- ✅ Input validation with Zod
- ✅ Secure error handling

## 📦 Installed Packages

- `bcrypt` - Password hashing library
- `jsonwebtoken` - JWT token generation and verification
- `@types/bcrypt` - TypeScript types for bcrypt
- `@types/jsonwebtoken` - TypeScript types for jsonwebtoken

## 🔧 Configuration

### Environment Variables (.env)
Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=1h
```

**Important**: 
- Use a strong, random secret (minimum 32 characters) in production
- Never commit `.env` file to version control
- Use different secrets for development and production

## 📁 File Structure

```
src/
├── config/
│   └── index.ts              # Configuration with JWT settings
├── middleware/
│   └── auth.ts               # JWT authentication middleware
└── app/modules/users/
    ├── user.interface.ts     # TypeScript interfaces
    ├── user.model.ts         # Mongoose model with password hashing
    ├── user.validation.ts    # Zod validation schemas
    ├── user.services.ts      # Business logic (registration, login)
    ├── user.controller.ts    # Request handlers
    └── user.route.ts         # API routes
```

## 🔐 How It Works

### 1. User Registration

**Endpoint**: `POST /api/v1/user/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "01234567890",
  "password": "password123",
  "role": "admin",
  "userType": "reserveit"
}
```

**Validation**:
- `name`: Required, non-empty string
- `phone`: Required, exactly 11 digits
- `password`: Required, minimum 6 characters
- `role`: **Required, must be either "admin" or "user"**
- `userType`: **Required, must be exactly "reserveit"** (mandatory for registration and login)

**Process**:
1. Validates input using Zod schema (including role and userType validation)
2. Checks if userType is "reserveit" (service-level validation - mandatory)
3. Checks if user with phone already exists
4. Generates unique user ID (custom `id` field)
5. Password is automatically hashed by Mongoose pre-save hook (bcrypt with cost factor 12)
6. User is saved to database with both `_id` (Mongoose default) and `id` (custom)
7. Returns user data (password excluded, includes both IDs, role, and userType)

**Response**:
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "00001",
    "name": "John Doe",
    "phone": "01234567890",
    "role": "admin",
    "userType": "reserveit",
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T..."
  }
}
```

**Error Responses**:
- `403 Forbidden`: If userType is not "reserveit"
- `409 Conflict`: If user with phone already exists
- `400 Bad Request`: If validation fails

### 2. User Login

**Endpoint**: `POST /api/v1/user/login`

**Request Body**:
```json
{
  "phone": "01234567890",
  "password": "password123"
}
```

**Process**:
1. Validates input (phone: 11 digits, password: required)
2. Finds user by phone number
3. **Checks if user has userType "reserveit"** - only users with userType "reserveit" can login
4. Compares provided password with hashed password using bcrypt
5. If password matches, generates JWT token (includes role and userType)
6. Returns token and user data (includes both `_id` and `id`, role, and userType)

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "id": "00001",
      "name": "John Doe",
      "phone": "01234567890",
      "role": "admin",
      "userType": "reserveit"
    }
  }
}
```

**Error Responses**:
- `403 Forbidden`: If user userType is not "reserveit"
- `401 Unauthorized`: If phone/password is invalid

### 3. Dual ID System

**Both `_id` and `id` Fields:**

The system uses both identifiers:
- **`_id`**: Mongoose's default ObjectId (automatically generated)
- **`id`**: Custom sequential ID (e.g., "00001", "00002")

**Why Both?**
- `_id`: Standard MongoDB identifier, globally unique
- `id`: Human-readable, sequential identifier for business logic

**Usage:**
- Both IDs are included in all responses
- Both IDs can be used for queries
- JWT token contains the custom `id` field
- Database queries can use either identifier

### 4. Role and UserType-Based Access Control

**Role System:**
- `role`: Can be either **"admin"** or **"user"**
- Default role is **"user"** if not specified
- Used for role-based access control within the application

**UserType System:**
- `userType`: Must be **"reserveit"** (mandatory)
- Default userType is **"reserveit"**
- Used to control registration and login access

**"reserveit" UserType Requirement:**

1. **Registration**: Only users with `userType: "reserveit"` can register
   - Validation schema enforces userType must be "reserveit"
   - Service layer double-checks the userType
   - Returns `403 Forbidden` if userType is not "reserveit"
   - Role can be "admin" or "user" (defaults to "user" if not provided)

2. **Login**: Only users with `userType: "reserveit"` can login
   - Service checks userType before allowing login
   - Returns `403 Forbidden` if userType is not "reserveit"
   - Role does not affect login ability (only userType matters)

3. **Model Definitions**:
   - Role enum: `['admin', 'user']` - Default: `'user'`
   - UserType enum: `['reserveit']` - Default: `'reserveit'`

**Important**: Users without `userType: "reserveit"` cannot:
- Register new accounts
- Login to the system
- Access protected endpoints (even with valid credentials)

**Note**: The `role` field ("admin" or "user") is separate from `userType` and can be used for additional authorization logic within your application, but does not affect registration/login eligibility.

### 5. Password Hashing (Automatic)

**Location**: `src/app/modules/users/user.model.ts`

The password is automatically hashed before saving to the database using a Mongoose pre-save hook:

```typescript
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next()
  }
  
  // Hash with bcrypt (cost factor 12 = 2^12 iterations)
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
```

**Why bcrypt?**
- One-way hashing (cannot be reversed)
- Includes salt automatically (prevents rainbow table attacks)
- Cost factor makes it computationally expensive to brute force
- Industry standard for password storage

### 6. JWT Token

**What is JWT?**
- JSON Web Token - a secure way to transmit information
- Contains user info (id, phone, role) encoded in the token
- Signed with secret key to prevent tampering
- Has expiration time (default: 1 hour)

**Token Structure**:
```
Header.Payload.Signature
```

**Payload** (decoded):
```json
{
  "id": "00001",
  "phone": "01234567890",
  "role": "admin",
  "userType": "reserveit",
  "iat": 1234567890,  // issued at
  "exp": 1234571490   // expires at
}
```

### 7. Authentication Middleware

**Location**: `src/middleware/auth.ts`

**How to Use**:
Add `auth` middleware to any route that requires authentication:

```typescript
import { auth } from '../middleware/auth'

router.get('/profile', auth, getProfile)
```

**What It Does**:
1. Extracts token from `Authorization` header (format: `Bearer <token>`)
2. Verifies token signature and expiration
3. Finds user in database (using custom `id` from token)
4. Includes both `_id`, `id`, `role`, and `userType` in query
5. Attaches user info to `req.user` (includes role and userType)
6. Calls `next()` to continue to route handler
7. Returns 401 error if token is invalid/expired

**Example Protected Route**:
```typescript
// GET /api/v1/user/profile
export const getProfile = tryCatch(async (req: Request, res: Response) => {
  // req.user is available (set by auth middleware)
  // Query includes both _id and id fields, plus role and userType
  const user = await User.findOne(
    { id: req.user?.id },
    { _id: 1, id: 1, name: 1, phone: 1, role: 1, userType: 1, createdAt: 1, updatedAt: 1 }
  )
  sendRes(res, {
    statusCode: status.OK,
    success: true,
    message: 'User profile retrieved successfully',
    result: user,
  })
})
```

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Passwords are never stored in plain text
2. **Bcrypt Cost Factor**: Set to 12 (balance between security and performance)
3. **JWT Expiration**: Tokens expire after 1 hour (configurable)
4. **Token Verification**: Every request validates token signature
5. **Password Exclusion**: Passwords are excluded from queries by default (`select: 0`)
6. **Input Validation**: Zod schemas validate all inputs
7. **Error Messages**: Generic error messages prevent user enumeration attacks
8. **Environment Variables**: Secrets stored in `.env`, not in code
9. **UserType-Based Access**: Only users with userType "reserveit" can register/login
10. **Dual Validation**: Both schema and service layer validate userType
11. **Role System**: Separate role field ("admin" or "user") for application-level authorization

## 📝 API Endpoints

### Public Endpoints

1. **Register User** (Requires userType "reserveit")
   - `POST /api/v1/user/register`
   - Body: `{ name, phone, password, role: "admin" | "user", userType: "reserveit" }`
   - Returns: User object with both `_id` and `id`, role, and userType

2. **Login** (Only users with userType "reserveit" can login)
   - `POST /api/v1/user/login`
   - Body: `{ phone, password }`
   - Returns: `{ accessToken, user }` (user includes both IDs, role, and userType)

### Protected Endpoints (Require Auth Token)

3. **Get Profile**
   - `GET /api/v1/user/profile`
   - Header: `Authorization: Bearer <token>`
   - Returns: User profile with both `_id` and `id`

## 🧪 Testing with Postman/Thunder Client

### 1. Register a User (with userType "reserveit")

```
POST http://localhost:5000/api/v1/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "01234567890",
  "password": "password123",
  "role": "admin",
  "userType": "reserveit"
}
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "00001",
    "name": "John Doe",
    "phone": "01234567890",
    "role": "admin",
    "userType": "reserveit",
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T..."
  }
}
```

**Error if userType is not "reserveit":**
```json
{
  "statusCode": 403,
  "success": false,
  "message": "UserType must be \"reserveit\" for registration"
}
```

### 2. Login

```
POST http://localhost:5000/api/v1/user/login
Content-Type: application/json

{
  "phone": "01234567890",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "id": "00001",
      "name": "John Doe",
      "phone": "01234567890",
      "role": "admin",
      "userType": "reserveit"
    }
  }
}
```

**Error if user doesn't have userType "reserveit":**
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Access denied. Only users with userType \"reserveit\" can login"
}
```

Copy the `accessToken` from the response.

### 3. Access Protected Route

```
GET http://localhost:5000/api/v1/user/profile
Authorization: Bearer <paste-accessToken-here>
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile retrieved successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "00001",
    "name": "John Doe",
    "phone": "01234567890",
    "role": "admin",
    "userType": "reserveit",
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T..."
  }
}
```

## 🚨 Common Errors

1. **"JWT secret is not configured"**
   - Add `JWT_SECRET` to your `.env` file

2. **"Invalid phone or password"**
   - Check phone number format (exactly 11 digits)
   - Verify password is correct
   - User might not exist

3. **"UserType must be \"reserveit\" for registration"**
   - Registration requires `userType: "reserveit"` in request body
   - Check that userType field is exactly "reserveit" (case-sensitive)
   - Role can be "admin" or "user" (defaults to "user" if not provided)

4. **"Access denied. Only users with userType \"reserveit\" can login"**
   - User exists but doesn't have userType "reserveit"
   - Only users with userType "reserveit" can login
   - Role ("admin" or "user") does not affect login eligibility

5. **"Token has expired"**
   - Token expired (default: 1 hour)
   - User needs to login again

6. **"You are not authorized!"**
   - Missing or invalid `Authorization` header
   - Format should be: `Bearer <token>`

## 📚 Key Concepts Explained

### Why Hash Passwords?
- If database is compromised, attackers can't see actual passwords
- Even with the hash, it's computationally expensive to crack
- Different users with same password get different hashes (salt)

### Why JWT?
- Stateless authentication (no session storage needed)
- Scalable (works across multiple servers)
- Contains user info (reduces database queries)
- Self-contained (signature prevents tampering)

### Why Middleware?
- Reusable authentication logic
- Clean separation of concerns
- Easy to apply to multiple routes
- Centralized error handling

### Why Dual ID System?
- `_id`: Standard MongoDB identifier, globally unique, used by Mongoose
- `id`: Custom sequential ID, human-readable, useful for business logic
- Both available for flexibility in queries and responses

### Why UserType-Based Access?
- Restricts registration/login to authorized users only (userType: "reserveit")
- Prevents unauthorized access at multiple layers
- Easy to extend for different userType requirements
- Role ("admin" or "user") is separate and used for application-level authorization

## 🔄 Next Steps

1. **Refresh Tokens**: Implement refresh token mechanism for longer sessions
2. **Password Reset**: Add forgot password functionality
3. **Email Verification**: Verify user email/phone
4. **Rate Limiting**: Prevent brute force attacks
5. **2FA**: Add two-factor authentication
6. **Additional Roles**: Extend role system for different user types
7. **Role Permissions**: Implement granular permissions per role

## 📖 Code Examples

### Protecting a Route
```typescript
import { auth } from '../middleware/auth'

router.get('/protected', auth, protectedController)
```

### Accessing User in Controller
```typescript
export const myController = tryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id           // Custom ID
  const userRole = req.user?.role       // User role ("admin" or "user")
  const userType = req.user?.userType   // UserType ("reserveit")
  // ... your logic
})
```

### Querying with Both IDs
```typescript
// Query by custom id
const userById = await User.findOne({ id: '00001' })

// Query by Mongoose _id
const userByMongoId = await User.findById('507f1f77bcf86cd799439011')

// Both IDs included in response
const user = await User.findOne({ phone: '01234567890' }, { _id: 1, id: 1, name: 1 })
```

### Custom Error Handling
The auth middleware automatically handles:
- Missing token
- Invalid token
- Expired token
- User not found

All errors are passed to your global error handler.

### UserType Validation Example
```typescript
// In validation schema
role: z.enum(['admin', 'user'], {
  required_error: 'Role is required',
  invalid_type_error: 'Role must be either "admin" or "user"',
}),
userType: z
  .string({ required_error: 'UserType is required' })
  .refine(val => val === 'reserveit', {
    message: 'UserType must be "reserveit"',
  })

// In service
if (data.userType !== 'reserveit') {
  throw new ApiError(status.FORBIDDEN, 'UserType must be "reserveit" for registration')
}
```

## 📋 Data Model

### User Schema
```typescript
{
  _id: ObjectId,           // Mongoose default (auto-generated)
  id: String,              // Custom sequential ID (e.g., "00001")
  name: String,            // Required
  phone: String,           // Required, unique, exactly 11 digits
  password: String,        // Required, hashed with bcrypt
  role: String,            // Required, enum: ['admin', 'user'], default: 'user'
  userType: String,        // Required, enum: ['reserveit'], default: 'reserveit'
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## 🎯 Summary

This authentication system provides:
- ✅ Secure password storage (bcrypt hashing)
- ✅ JWT token-based authentication
- ✅ Role-based access control (`role`: "admin" or "user")
- ✅ UserType-based access control (`userType`: must be "reserveit" - mandatory)
- ✅ Dual ID system (`_id` and `id`)
- ✅ Comprehensive input validation
- ✅ Secure error handling
- ✅ Production-ready security practices

**Built with security and best practices in mind** 🔒

---

# Blog System - Implementation Guide

## Overview
This guide explains the secure Blog System built for your Node.js/Express/MongoDB application with full CRUD operations, JWT authentication, and role-based access control.

## 📁 Blog Module Structure

```
src/app/modules/blogs/
├── blog.interface.ts     # TypeScript interfaces
├── blog.model.ts         # Mongoose model with User reference
├── blog.validation.ts    # Zod validation schemas
├── blog.services.ts      # Business logic (CRUD operations)
├── blog.controller.ts    # Request handlers
└── blog.route.ts         # API routes with auth middleware
```

## 📋 Blog Model

### Fields

- **title** (string, required): Blog title, max 200 characters
- **description** (string, required): Blog content/description
- **status** ("draft" | "published", required): Blog publication status
- **category** (string, optional): Blog category/tag - must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification (defaults to null if not provided)
- **author** (ObjectId, required): Reference to User model
- **createdAt** (Date, auto-generated): Creation timestamp
- **updatedAt** (Date, auto-generated): Last update timestamp
- **publishedAt** (Date, optional): Publication date (auto-set when status changes to "published")
- **image** (string, optional): Base64 encoded image

### Model Features

1. **Automatic Timestamps**: `createdAt` and `updatedAt` are automatically managed
2. **Published Date**: Automatically set when status changes to "published"
3. **Category System**: Optional categorization with predefined tags (Featured, Announcement, Event, Reminder, News, Alert, Notification). Defaults to null if not provided.
4. **Indexes**: Optimized queries on `author`, `status`, `category`, and `publishedAt`
5. **User Reference**: Links blog to User via MongoDB ObjectId

## 🔐 CRUD Operations

### 1. Create Blog

**Endpoint**: `POST /api/v1/blog`

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "title": "My First Blog Post",
  "description": "This is the content of my blog post...",
  "status": "draft",
  "category": "News", // Optional - defaults to null if not provided
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..." // Optional
}
```

**Validation**:
- `title`: Required, 1-200 characters
- `description`: Required, non-empty
- `status`: Required, must be "draft" or "published"
- `category`: Optional, must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification (defaults to null if not provided)
- `image`: Optional, must be valid base64 format if provided

**Process**:
1. Validates JWT token (auth middleware)
2. Validates input using Zod schema
3. Sets author to authenticated user's MongoDB `_id`
4. Creates blog in database
5. Populates author information
6. Returns created blog

**Response**:
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Blog created successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My First Blog Post",
    "description": "This is the content...",
    "status": "draft",
    "category": "News", // or null if not provided
    "author": {
      "_id": "507f191e810c19729de860ea",
      "id": "00001",
      "name": "John Doe",
      "phone": "01234567890"
    },
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T...",
    "publishedAt": null,
    "image": null
  }
}
```

### 2. Get All Published Blogs

**Endpoint**: `GET /api/v1/blog?page=1&limit=10&status=published&category=News`

**Authentication**: Not required (public)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status - "draft" or "published" (default: "published")
- `category` (optional): Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification

**Process**:
1. Fetches blogs filtered by status (default: "published") and optional category
2. Sorts by `publishedAt` for published blogs, `createdAt` for drafts (newest first)
3. Applies pagination
4. Populates author information
5. Returns paginated results

**Filtering Examples**:
- `GET /api/v1/blog?status=published&category=News` - Get published News blogs
- `GET /api/v1/blog?category=Featured` - Get published Featured blogs (status defaults to published)
- `GET /api/v1/blog?status=draft&category=Announcement` - Get draft Announcement blogs

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Published blogs retrieved successfully",
  "result": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Published Blog",
        "description": "Content...",
        "status": "published",
        "category": "News",
        "author": {
          "_id": "507f191e810c19729de860ea",
          "id": "00001",
          "name": "John Doe",
          "phone": "01234567890"
        },
        "publishedAt": "2026-01-13T...",
        "createdAt": "2026-01-13T...",
        "updatedAt": "2026-01-13T..."
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3. Get My Blogs

**Endpoint**: `GET /api/v1/blog/my/blogs?page=1&limit=10&status=published&category=News`

**Authentication**: Required (JWT token)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status - "draft" or "published"
- `category` (optional): Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification

**Process**:
1. Validates JWT token
2. Fetches blogs by authenticated user (filtered by optional status and category)
3. Sorts by `publishedAt` for published blogs, `createdAt` for drafts (newest first)
4. Applies pagination
5. Returns paginated results

**Filtering Examples**:
- `GET /api/v1/blog/my/blogs?category=Event` - Get all your Event blogs
- `GET /api/v1/blog/my/blogs?status=draft&category=News` - Get your draft News blogs

**Response**: Same format as "Get All Published Blogs"

### 4. Get Blog by ID

**Endpoint**: `GET /api/v1/blog/:id`

**Authentication**: Optional (required only for draft blogs)

**Process**:
1. Finds blog by ID
2. If blog is "published": Anyone can view
3. If blog is "draft": Only author can view (requires authentication)
4. Returns blog with author information

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blog retrieved successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Blog",
    "description": "Content...",
    "status": "published",
    "author": {
      "_id": "507f191e810c19729de860ea",
      "id": "00001",
      "name": "John Doe",
      "phone": "01234567890"
    },
    "publishedAt": "2026-01-13T...",
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T..."
  }
}
```

**Error Responses**:
- `404 Not Found`: Blog doesn't exist
- `403 Forbidden`: Trying to view draft blog without ownership

### 5. Update Blog

**Endpoint**: `PATCH /api/v1/blog/:id`

**Authentication**: Required (JWT token)

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated content...",
  "status": "published",
  "category": "Featured",
  "image": "data:image/png;base64,..."
}
```

**Process**:
1. Validates JWT token
2. Validates input
3. Finds blog by ID
4. Checks if user is the author (ownership verification)
5. Updates blog fields
6. If status changes to "published", sets `publishedAt`
7. Returns updated blog

**Response**: Same format as create blog

**Error Responses**:
- `404 Not Found`: Blog doesn't exist
- `403 Forbidden`: User is not the author
- `401 Unauthorized`: Not logged in

### 6. Delete Blog

**Endpoint**: `DELETE /api/v1/blog/:id`

**Authentication**: Required (JWT token)

**Process**:
1. Validates JWT token
2. Finds blog by ID
3. Checks if user is the author (ownership verification)
4. Deletes blog from database (hard delete)
5. Returns success message

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blog deleted successfully",
  "result": null
}
```

**Error Responses**:
- `404 Not Found`: Blog doesn't exist
- `403 Forbidden`: User is not the author
- `401 Unauthorized`: Not logged in

## 🔒 Security Features

1. **JWT Authentication**: All create, update, delete operations require valid JWT token
2. **Ownership Verification**: Only blog owner can update/delete
3. **Draft Protection**: Draft blogs are only visible to their authors
4. **Input Validation**: Zod schemas validate all inputs
5. **Base64 Image Validation**: Validates image format if provided
6. **Pagination Limits**: Prevents excessive data retrieval (max 100 items per page)

## 📝 API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/blog` | Get all published blogs (paginated) | No |
| GET | `/api/v1/blog/:id` | Get blog by ID (published or own draft) | Optional |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/blog` | Create new blog | Yes |
| GET | `/api/v1/blog/my/blogs` | Get my blogs (paginated) | Yes |
| PATCH | `/api/v1/blog/:id` | Update blog | Yes (owner only) |
| DELETE | `/api/v1/blog/:id` | Delete blog | Yes (owner only) |

## 🧪 Testing Examples

### 1. Create Blog (Requires Auth Token)

```
POST http://localhost:5000/api/v1/blog
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "My First Blog",
  "description": "This is my first blog post content...",
  "status": "draft",
  "category": "News",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### 2. Get All Published Blogs

```
GET http://localhost:5000/api/v1/blog?page=1&limit=10
```

**With Filters**:
```
GET http://localhost:5000/api/v1/blog?page=1&limit=10&status=published&category=News
GET http://localhost:5000/api/v1/blog?category=Featured
GET http://localhost:5000/api/v1/blog?status=draft&category=Announcement
```

### 3. Get My Blogs

```
GET http://localhost:5000/api/v1/blog/my/blogs?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

**With Filters**:
```
GET http://localhost:5000/api/v1/blog/my/blogs?category=Event
Authorization: Bearer <your-jwt-token>
GET http://localhost:5000/api/v1/blog/my/blogs?status=draft&category=News
Authorization: Bearer <your-jwt-token>
```

### 4. Get Blog by ID

```
GET http://localhost:5000/api/v1/blog/507f1f77bcf86cd799439011
```

### 5. Update Blog

```
PATCH http://localhost:5000/api/v1/blog/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published",
  "category": "Featured"
}
```

### 6. Delete Blog

```
DELETE http://localhost:5000/api/v1/blog/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

## 🚨 Common Errors

1. **"You must be logged in to create a blog"**
   - Missing or invalid JWT token
   - Add `Authorization: Bearer <token>` header

2. **"You do not have permission to update this blog"**
   - User is not the blog author
   - Only the author can update/delete their blogs

3. **"Blog not found"**
   - Invalid blog ID
   - Blog may have been deleted

4. **"You do not have permission to view this blog"**
   - Trying to view a draft blog without being the author
   - Login and use your token

5. **"Status must be either 'draft' or 'published'"**
   - Invalid status value
   - Use exactly "draft" or "published"

6. **"Image must be a valid base64 encoded image"**
   - Invalid image format
   - Use format: `data:image/png;base64,<base64-string>`

7. **"Category must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification"**
   - Invalid category value
   - Use exactly one of the allowed categories (case-sensitive)

## 📚 Key Concepts

### Pagination

The system uses offset-based pagination:
- `page`: Page number (starts at 1)
- `limit`: Items per page (1-100)
- Response includes: `total`, `page`, `limit`, `totalPages`

### Blog Status

- **draft**: Blog is not publicly visible, only author can view
- **published**: Blog is publicly visible to everyone

### Blog Categories

Blogs can be categorized using the following predefined categories:
- **Featured**: Highlighted or featured content
- **Announcement**: Important announcements
- **Event**: Event-related content
- **Reminder**: Reminder notifications
- **News**: News articles
- **Alert**: Alert messages
- **Notification**: General notifications

**Category Filtering**:
- Categories can be used to filter blogs in list endpoints
- Filter by category: `?category=News`
- Combine with status: `?status=published&category=Featured`
- Categories are case-sensitive and must match exactly

### Ownership Verification

Before update/delete operations:
1. System finds blog by ID
2. Compares blog's `author` field with authenticated user's MongoDB `_id`
3. Only proceeds if they match

### Image Storage

- Images are stored as base64 strings in the database
- Format: `data:image/<type>;base64,<base64-encoded-data>`
- Optional field - blogs can exist without images
- For production, consider using cloud storage (AWS S3, Cloudinary) instead

## 🔄 Integration with Auth System

The blog system integrates seamlessly with the authentication system:

1. **Auth Middleware**: Verifies JWT token and attaches user info to `req.user`
2. **User Reference**: Blogs reference users via MongoDB ObjectId
3. **Ownership**: Uses `req.user._id` to verify blog ownership
4. **Protected Routes**: Uses `auth` middleware for create, update, delete operations

## 📖 Code Examples

### Creating a Blog (Service Layer)

```typescript
export const createBlogService = async (
  data: Omit<IBlog, '_id' | 'createdAt' | 'updatedAt'>,
  authorMongoId: string,
): Promise<IBlog> => {
  const blogData: IBlog = {
    ...data,
    author: new Types.ObjectId(authorMongoId),
  }
  
  const result = await Blog.create(blogData)
  await result.populate('author', 'name phone id _id')
  return result
}
```

### Checking Ownership (Service Layer)

```typescript
const blog = await Blog.findById(blogId)
if (blog.author.toString() !== userMongoId) {
  throw new ApiError(status.FORBIDDEN, 'Permission denied')
}
```

### Using Auth Middleware (Route)

```typescript
import { auth } from '../../../middleware/auth'

router.post('/', auth, reqValidate(createBlogZod), createBlog)
```

## 🎯 Best Practices Implemented

1. ✅ **Separation of Concerns**: Model, Service, Controller, Route layers
2. ✅ **Input Validation**: Zod schemas for all inputs
3. ✅ **Error Handling**: Proper HTTP status codes and error messages
4. ✅ **Pagination**: Prevents excessive data retrieval
5. ✅ **Ownership Verification**: Ensures users can only modify their own blogs
6. ✅ **Type Safety**: TypeScript interfaces and types throughout
7. ✅ **Database Indexes**: Optimized queries on frequently accessed fields
8. ✅ **Automatic Timestamps**: Mongoose handles createdAt/updatedAt
9. ✅ **Population**: Efficiently loads related user data
10. ✅ **Status Management**: Automatic publishedAt handling

## 🔄 Next Steps

1. **Soft Delete**: Implement soft delete with `deletedAt` field
2. **Image Upload**: Add file upload endpoint for images
3. **Search**: Implement full-text search on title and description
4. **Categories/Tags**: Add categorization system
5. **Comments**: Add comment system for blogs
6. **Likes/Views**: Add engagement metrics
7. **Draft Auto-save**: Auto-save drafts periodically
8. **Rich Text Editor**: Support for formatted content

---

**Blog System built with security, scalability, and best practices in mind** 📝🔒
