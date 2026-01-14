# Swagger API Documentation

## Overview

This project includes comprehensive Swagger/OpenAPI documentation for all API endpoints. The documentation is automatically generated and provides an interactive interface for testing and exploring the API.

## Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:5000/api-docs
```

The OpenAPI JSON specification is available at:

```
http://localhost:5000/api-docs.json
```

## Features

- ✅ **Interactive API Testing**: Test endpoints directly from the browser
- ✅ **Complete Schema Definitions**: All request/response schemas documented
- ✅ **Authentication Support**: JWT Bearer token authentication built-in
- ✅ **Request Examples**: Pre-filled examples for all endpoints
- ✅ **Response Examples**: Sample responses for success and error cases
- ✅ **Parameter Validation**: Query parameters, path parameters, and request bodies
- ✅ **Error Documentation**: All possible error responses documented

## Using the Swagger UI

### 1. Authentication

Most endpoints require authentication. To authenticate:

1. Use the **Authorize** button (🔒) at the top of the Swagger UI
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click **Authorize**
4. The token will be included in all subsequent requests

**Getting a Token:**

1. Use the `/user/login` endpoint to get an access token
2. Copy the `accessToken` from the response
3. Use it in the Authorize dialog

### 2. Testing Endpoints

1. Click on any endpoint to expand it
2. Click **Try it out**
3. Fill in the required parameters
4. Click **Execute**
5. View the response below

### 3. Request Examples

All endpoints include example request bodies. You can:
- Modify the examples directly in the Swagger UI
- Copy the examples for use in Postman or other tools
- Use them as templates for your requests

## API Endpoints Documentation

### Authentication Endpoints

- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - User login (get JWT token)

### User Endpoints

- `GET /api/v1/user/profile` - Get current user profile (Auth required)

### Blog Endpoints

- `POST /api/v1/blog` - Create a new blog (Auth required)
- `GET /api/v1/blog` - Get all published blogs (Public)
- `GET /api/v1/blog/my/blogs` - Get my blogs (Auth required)
- `GET /api/v1/blog/{id}` - Get blog by ID (Public/Author only for drafts)
- `PATCH /api/v1/blog/{id}` - Update blog (Owner/Admin only)
- `DELETE /api/v1/blog/{id}` - Delete blog (Owner/Admin only)

### Admin Endpoints

- `GET /api/v1/user/admin/users` - Get all users (Admin only)
- `GET /api/v1/user/admin/users/{id}` - Get user by ID (Admin only)
- `PATCH /api/v1/user/admin/users/{id}` - Update user (Admin only)
- `DELETE /api/v1/user/admin/users/{id}` - Delete user (Admin only)

## Response Format

All API responses follow a consistent structure:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "result": { ... }
}
```

## Error Format

Error responses follow this structure:

```json
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
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Resource already exists)
- `413` - Payload Too Large (Image exceeds 1MB)
- `500` - Internal Server Error

## Blog Categories

Blogs can be categorized using these predefined categories:

- `Featured` - Highlighted content
- `Announcement` - Important announcements
- `Event` - Event-related content
- `Reminder` - Reminder notifications
- `News` - News articles
- `Alert` - Alert messages
- `Notification` - General notifications

Category is optional and defaults to `null` if not provided.

## Pagination

List endpoints support pagination:

- `page` - Page number (default: 1, minimum: 1)
- `limit` - Items per page (default: 10, minimum: 1, maximum: 100)

Response includes:
- `data` - Array of items
- `total` - Total number of items
- `page` - Current page number
- `limit` - Items per page
- `totalPages` - Total number of pages

## Image Upload

Blogs support base64 encoded images:

- Format: `data:image/{type};base64,{base64-data}`
- Supported types: `png`, `jpeg`, `jpg`, `gif`, `webp`
- Maximum size: 1MB (original file size)
- Optional field

## User Roles

- `admin` - Full access, can manage all users and blogs
- `user` - Standard user, can manage own blogs

## UserType

All users must have `userType: "reserveit"` to register and login.

## Development

### Updating Documentation

Documentation is defined in:
- `src/config/swagger.ts` - Main Swagger configuration and schemas
- `src/docs/swagger.ts` - Route documentation with JSDoc comments

### Adding New Endpoints

1. Add the route documentation in `src/docs/swagger.ts` using JSDoc `@swagger` comments
2. Define any new schemas in `src/config/swagger.ts` under `components.schemas`
3. The documentation will be automatically updated when the server restarts

### Customization

You can customize the Swagger UI appearance in `src/app.ts`:

```typescript
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog API Documentation',
  customfavIcon: '/favicon.ico',
}
```

## Production Considerations

For production:

1. **Disable Swagger UI** in production or restrict access
2. **Update server URLs** in `src/config/swagger.ts` to your production domain
3. **Add rate limiting** to prevent abuse
4. **Use HTTPS** for all API endpoints
5. **Keep documentation updated** as the API evolves

## Troubleshooting

### Swagger UI not loading

- Ensure the server is running
- Check that `/api-docs` route is accessible
- Verify `swagger-jsdoc` and `swagger-ui-express` are installed

### Authentication not working

- Ensure you're using the correct token format: `Bearer <token>`
- Check that the token hasn't expired (default: 1 hour)
- Verify the token was obtained from the `/user/login` endpoint

### Schema errors

- Check that all JSDoc comments are properly closed
- Verify schema references use correct paths (e.g., `#/components/schemas/User`)
- Ensure all required fields are marked in schemas

## Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
