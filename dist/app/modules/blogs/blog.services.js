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
exports.deleteBlogService = exports.updateBlogService = exports.getBlogByIdService = exports.getMyBlogsService = exports.getAllPublishedBlogsService = exports.createBlogService = void 0;
const mongoose_1 = require("mongoose");
const blog_model_1 = require("./blog.model");
const apiError_1 = require("../../../errorFormating/apiError");
const http_status_1 = __importDefault(require("http-status"));
/**
 * Create Blog Service
 * Only logged-in users can create blogs
 */
const createBlogService = (data, authorMongoId) => __awaiter(void 0, void 0, void 0, function* () {
    const blogData = Object.assign(Object.assign({}, data), { author: new mongoose_1.Types.ObjectId(authorMongoId) });
    const result = yield blog_model_1.Blog.create(blogData);
    // Populate author info
    yield result.populate('author', 'name phone id _id');
    return result;
});
exports.createBlogService = createBlogService;
/**
 * Get All Blogs Service
 * Supports pagination and status filtering
 * Default: shows only published blogs
 * Can filter by status: ?status=published or ?status=draft
 */
const getAllPublishedBlogsService = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;
    // Build query filter - default to 'published' if no status specified
    const filter = {
        status: status || 'published',
    };
    // Determine sort field based on status
    // Published blogs sorted by publishedAt, drafts sorted by createdAt
    const sortField = filter.status === 'published' ? 'publishedAt' : 'createdAt';
    // Get blogs based on status filter, sorted appropriately
    const [blogs, total] = yield Promise.all([
        blog_model_1.Blog.find(filter)
            .populate('author', 'name phone id _id')
            .sort({ [sortField]: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        blog_model_1.Blog.countDocuments(filter),
    ]);
    return {
        data: blogs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
});
exports.getAllPublishedBlogsService = getAllPublishedBlogsService;
/**
 * Get My Blogs Service
 * Returns all blogs by the authenticated user (both draft and published)
 * Supports pagination
 */
const getMyBlogsService = (authorMongoId, // MongoDB _id
options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const [blogs, total] = yield Promise.all([
        blog_model_1.Blog.find({ author: new mongoose_1.Types.ObjectId(authorMongoId) })
            .populate('author', 'name phone id _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        blog_model_1.Blog.countDocuments({ author: new mongoose_1.Types.ObjectId(authorMongoId) }),
    ]);
    return {
        data: blogs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
});
exports.getMyBlogsService = getMyBlogsService;
/**
 * Get Single Blog by ID Service
 * Users can get published blogs or their own blogs (even if draft)
 */
const getBlogByIdService = (blogId, userMongoId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const blog = yield blog_model_1.Blog.findById(blogId)
        .populate('author', 'name phone id _id')
        .lean();
    if (!blog) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    // If blog is published, anyone can view it
    if (blog.status === 'published') {
        return blog;
    }
    // If blog is draft, only the author can view it
    if (userMongoId && blog.author) {
        const authorMongoId = typeof blog.author === 'object'
            ? (_a = blog.author._id) === null || _a === void 0 ? void 0 : _a.toString()
            : blog.author.toString();
        if (authorMongoId === userMongoId) {
            return blog;
        }
    }
    throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'You do not have permission to view this blog');
});
exports.getBlogByIdService = getBlogByIdService;
/**
 * Update Blog Service
 * Only blog owner can update
 */
const updateBlogService = (blogId, updateData, userMongoId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find blog and check ownership
    const blog = yield blog_model_1.Blog.findById(blogId);
    if (!blog) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    // Check if user is the author
    if (blog.author.toString() !== userMongoId) {
        throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'You do not have permission to update this blog');
    }
    // Update fields
    Object.assign(blog, updateData);
    // Save and populate author
    yield blog.save();
    yield blog.populate('author', 'name phone id _id');
    return blog;
});
exports.updateBlogService = updateBlogService;
/**
 * Delete Blog Service
 * Only blog owner can delete (soft delete - sets status to deleted or removes)
 */
const deleteBlogService = (blogId, userMongoId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find blog and check ownership
    const blog = yield blog_model_1.Blog.findById(blogId);
    if (!blog) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    // Check if user is the author
    if (blog.author.toString() !== userMongoId) {
        throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'You do not have permission to delete this blog');
    }
    // Hard delete (you can change this to soft delete by adding a deletedAt field)
    yield blog_model_1.Blog.findByIdAndDelete(blogId);
});
exports.deleteBlogService = deleteBlogService;
