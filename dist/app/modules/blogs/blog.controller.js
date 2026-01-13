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
 * Supports pagination and status filtering
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - status: Filter by status - "draft" or "published" (default: "published")
 * Note: Query params are validated and transformed by paginationZod middleware
 */
exports.getAllPublishedBlogs = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Query params are already validated and transformed by paginationZod
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const statusFilter = req.query.status;
    const options = {
        page,
        limit,
        status: statusFilter,
    };
    const result = yield (0, blog_services_1.getAllPublishedBlogsService)(options);
    const statusMessage = statusFilter
        ? `${statusFilter} blogs`
        : 'published blogs';
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${statusMessage} retrieved successfully`,
        result: result,
    });
}));
/**
 * Get My Blogs Controller
 * Requires authentication
 * Returns all blogs by the authenticated user
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
    const options = {
        page,
        limit,
    };
    const result = yield (0, blog_services_1.getMyBlogsService)(authorMongoId, options);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Your blogs retrieved successfully',
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
 * Requires authentication and ownership
 */
exports.updateBlog = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to update a blog',
            result: null,
        });
    }
    const result = yield (0, blog_services_1.updateBlogService)(id, req.body, userMongoId);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Blog updated successfully',
        result: result,
    });
}));
/**
 * Delete Blog Controller
 * Requires authentication and ownership
 */
exports.deleteBlog = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userMongoId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userMongoId) {
        return (0, sendRes_1.sendRes)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'You must be logged in to delete a blog',
            result: null,
        });
    }
    yield (0, blog_services_1.deleteBlogService)(id, userMongoId);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Blog deleted successfully',
        result: null,
    });
}));
