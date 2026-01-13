"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_controller_1 = require("./blog.controller");
const reqValidate_1 = __importDefault(require("../../../middleware/reqValidate"));
const blog_validation_1 = require("./blog.validation");
const auth_1 = require("../../../middleware/auth");
const router = express_1.default.Router();
// Protected routes (require authentication) - MUST come before /:id routes
router.post('/', auth_1.auth, (0, reqValidate_1.default)(blog_validation_1.createBlogZod), blog_controller_1.createBlog); // Create blog
router.get('/my/blogs', auth_1.auth, (0, reqValidate_1.default)(blog_validation_1.paginationZod), blog_controller_1.getMyBlogs); // Get my blogs
// Public routes (no authentication required)
router.get('/', (0, reqValidate_1.default)(blog_validation_1.paginationZod), blog_controller_1.getAllPublishedBlogs); // Get all published blogs
router.get('/:id', (0, reqValidate_1.default)(blog_validation_1.getBlogByIdZod), blog_controller_1.getBlogById); // Get single blog by ID
// Protected routes with ID (require authentication)
router.patch('/:id', auth_1.auth, (0, reqValidate_1.default)(blog_validation_1.updateBlogZod), blog_controller_1.updateBlog); // Update blog
router.delete('/:id', auth_1.auth, (0, reqValidate_1.default)(blog_validation_1.getBlogByIdZod), blog_controller_1.deleteBlog); // Delete blog
exports.default = router;
