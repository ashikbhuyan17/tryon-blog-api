"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogById = exports.getMyBlogs = exports.getAllPublishedBlogs = exports.createBlog = void 0;
const blog_services_1 = require("./blog.services");
const sendRes_1 = require("../../../utilities/sendRes");
const tryCatch_1 = require("../../../utilities/tryCatch");
const http_status_1 = __importDefault(require("http-status"));
/**
 * Create Blog Controller
 * Requires authentication (auth middleware)
 */
exports.createBlog = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // req.user is set by auth middleware
    const authorMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!authorMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to create a blog',
            result: null,
        });
    }
    const result = yield (0, blog_services_1.createBlogService)(req.body, authorMongoId);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Blog created successfully',
        result: result,
    });
}));
/**
 * Get All Blogs Controller
 * Public endpoint - no authentication required
 * Supports pagination, status filtering, and category filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (default: "published")
 *   - category: Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification
 * Note: Query params are validated and transformed by paginationZod middleware
 */
exports.getAllPublishedBlogs = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Query params are already validated and transformed by paginationZod
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const statusFilter = req.query.status;
    const categoryFilter = req.query.category;
    const options = {
        page,
        limit,
        status: statusFilter,
        category: categoryFilter,
    };
    const result = yield (0, blog_services_1.getAllPublishedBlogsService)(options);
    let message = 'Blogs retrieved successfully';
    if (statusFilter && categoryFilter) {
        message = `${statusFilter} ${categoryFilter} blogs retrieved successfully`;
    }
    else if (statusFilter) {
        message = `${statusFilter} blogs retrieved successfully`;
    }
    else if (categoryFilter) {
        message = `${categoryFilter} blogs retrieved successfully`;
    }
    else {
        message = 'Published blogs retrieved successfully';
    }
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: message,
        result: result,
    });
}));
/**
 * Get My Blogs Controller
 * Requires authentication
 * Returns all blogs by the authenticated user
 * Supports pagination, status filtering, and category filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (optional)
 *   - category: Filter by category - Featured, Announcement, Event, Reminder, News, Alert, Notification (optional)
 * Note: Query params are validated and transformed by paginationZod middleware
 */
exports.getMyBlogs = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authorMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!authorMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to view your blogs',
            result: null,
        });
    }
    // Query params are already validated and transformed by paginationZod
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const statusFilter = req.query.status;
    const categoryFilter = req.query.category;
    const options = {
        page,
        limit,
        status: statusFilter,
        category: categoryFilter,
    };
    const result = yield (0, blog_services_1.getMyBlogsService)(authorMongoId, options);
    let message = 'Your blogs retrieved successfully';
    if (statusFilter && categoryFilter) {
        message = `Your ${statusFilter} ${categoryFilter} blogs retrieved successfully`;
    }
    else if (statusFilter) {
        message = `Your ${statusFilter} blogs retrieved successfully`;
    }
    else if (categoryFilter) {
        message = `Your ${categoryFilter} blogs retrieved successfully`;
    }
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: message,
        result: result,
    });
}));
/**
 * Get Blog by ID Controller
 * Public for published blogs, requires ownership for draft blogs
 */
exports.getBlogById = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Optional - only needed for draft blogs
    const result = yield (0, blog_services_1.getBlogByIdService)(id, userMongoId);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Blog retrieved successfully',
        result: result,
    });
}));
/**
 * Update Blog Controller
 * Requires authentication and ownership (or admin role)
 */
exports.updateBlog = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const userMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!userMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to update a blog',
            result: null,
        });
    }
    const result = yield (0, blog_services_1.updateBlogService)(id, req.body, userMongoId, userRole);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Blog updated successfully',
        result: result,
    });
}));
/**
 * Delete Blog Controller
 * Requires authentication and ownership (or admin role)
 */
exports.deleteBlog = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const userMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!userMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to delete a blog',
            result: null,
        });
    }
    yield (0, blog_services_1.deleteBlogService)(id, userMongoId, userRole);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Blog deleted successfully',
        result: null,
    });
}));
