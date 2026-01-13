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
exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const user_services_1 = require("./user.services");
const sendRes_1 = require("../../../utilities/sendRes");
const tryCatch_1 = require("../../../utilities/tryCatch");
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("./user.model");
/**
 * User Registration Controller
 *
 * Handles user registration:
 * - Validates input (name, phone, password)
 * - Checks if user already exists
 * - Hashes password (done in model pre-save hook)
 * - Creates user in database
 * - Returns user data (without password)
 */
exports.registerUser = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, user_services_1.registerUserService)(req.body);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'User registered successfully',
        result: result,
    });
}));
/**
 * User Login Controller
 *
 * Handles user login:
 * - Validates input (phone, password)
 * - Checks if user exists
 * - Compares password using bcrypt
 * - Generates JWT token
 * - Returns token and user data
 */
exports.loginUser = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    const result = yield (0, user_services_1.loginUserService)(phone, password);
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User logged in successfully',
        result: result,
    });
}));
/**
 * Get Current User Profile
 *
 * Returns the authenticated user's profile
 * Requires auth middleware to be applied
 */
exports.getProfile = (0, tryCatch_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // User info is attached by auth middleware
    // Include both _id (Mongoose default) and id (custom)
    const user = yield user_model_1.User.findOne({ id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, { _id: 1, id: 1, name: 1, phone: 1, role: 1, createdAt: 1, updatedAt: 1 });
    (0, sendRes_1.sendRes)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile retrieved successfully',
        result: user,
    });
}));
