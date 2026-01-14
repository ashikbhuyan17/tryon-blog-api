"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const reqValidate_1 = __importDefault(require("../../../middleware/reqValidate"));
const user_validation_1 = require("./user.validation");
const auth_1 = require("../../../middleware/auth");
const admin_1 = require("../../../middleware/admin");
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, reqValidate_1.default)(user_validation_1.registerZod), user_controller_1.registerUser);
router.post('/login', (0, reqValidate_1.default)(user_validation_1.loginZod), user_controller_1.loginUser);
// Protected routes (require authentication)
router.get('/profile', auth_1.auth, user_controller_1.getProfile);
// Admin routes (require authentication + admin role)
router.get('/admin/users', auth_1.auth, admin_1.admin, (0, reqValidate_1.default)(user_validation_1.paginationZod), user_controller_1.getAllUsers);
router.get('/admin/users/:id', auth_1.auth, admin_1.admin, (0, reqValidate_1.default)(user_validation_1.getUserByIdZod), user_controller_1.getUserById);
router.patch('/admin/users/:id', auth_1.auth, admin_1.admin, (0, reqValidate_1.default)(user_validation_1.updateUserZod), user_controller_1.updateUser);
router.delete('/admin/users/:id', auth_1.auth, admin_1.admin, (0, reqValidate_1.default)(user_validation_1.getUserByIdZod), user_controller_1.deleteUser);
exports.default = router;
