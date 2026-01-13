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
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, reqValidate_1.default)(user_validation_1.registerZod), user_controller_1.registerUser);
router.post('/login', (0, reqValidate_1.default)(user_validation_1.loginZod), user_controller_1.loginUser);
// Protected routes (require authentication)
router.get('/profile', auth_1.auth, user_controller_1.getProfile);
exports.default = router;
