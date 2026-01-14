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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserService = exports.updateUserService = exports.getUserByIdService = exports.getAllUsersService = exports.createUserService = exports.loginUserService = exports.registerUserService = void 0;
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("./user.model");
const user_utils_1 = require("./user.utils");
const apiError_1 = require("../../../errorFormating/apiError");
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Registration service
const registerUserService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if userType is "reserveit" - mandatory for registration
    if (data.userType !== 'reserveit') {
        throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'UserType must be "reserveit" for registration');
    }
    // Check if user already exists
    const existingUser = yield user_model_1.User.isUserExist(data.phone);
    if (existingUser) {
        throw new apiError_1.ApiError(http_status_1.default.CONFLICT, 'User already exists with this phone number');
    }
    // Generate user ID
    const id = yield (0, user_utils_1.generateUserId)();
    // Create user (password will be hashed by pre-save hook)
    // Mongoose automatically creates _id, and we also set custom id
    const userData = {
        id,
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: data.role || 'user', // Default to 'user' if not provided
        userType: 'reserveit', // Force reserveit userType
    };
    const result = yield user_model_1.User.create(userData);
    // Remove password from response
    // Include both _id (Mongoose default) and id (custom)
    const _a = result.toObject(), { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return userWithoutPassword;
});
exports.registerUserService = registerUserService;
// Login service
const loginUserService = (phone, password, userType) => __awaiter(void 0, void 0, void 0, function* () {
    if (userType !== 'reserveit') {
        throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'UserType must be same as registration');
    }
    // Check if user exists
    const user = yield user_model_1.User.isUserExist(phone);
    if (!user) {
        throw new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Invalid phone or password');
    }
    // Check if user has "reserveit" userType - mandatory for login
    if (user.userType !== 'reserveit') {
        throw new apiError_1.ApiError(http_status_1.default.FORBIDDEN, 'Access denied. Only users with userType "reserveit" can login');
    }
    // Check if password matches
    const isPasswordMatched = yield user_model_1.User.isPasswordMatched(password, user.password);
    if (!isPasswordMatched) {
        throw new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Invalid phone or password');
    }
    // Generate JWT token
    const jwtSecret = config_1.default.jwt.secret;
    if (!jwtSecret) {
        throw new apiError_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT secret is not configured');
    }
    const payload = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
    };
    // @ts-ignore - jsonwebtoken type issue with expiresIn
    const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, {
        expiresIn: config_1.default.jwt.expires_in || '1h',
    });
    // Remove password from user object
    // Note: user._id is already a string from isUserExist
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    return {
        accessToken,
        user: userWithoutPassword,
    };
});
exports.loginUserService = loginUserService;
// Keep old service for backward compatibility (if needed)
const createUserService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // generated ID
    const id = yield (0, user_utils_1.generateUserId)();
    data.id = id;
    // default password
    if (!data.password) {
        data.password = config_1.default.user_default_pass;
    }
    const result = yield user_model_1.User.create(data);
    if (!result) {
        throw new Error('User create failed');
    }
    return result;
});
exports.createUserService = createUserService;
const getAllUsersService = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const [users, total] = yield Promise.all([
        user_model_1.User.find({}, { password: 0 }) // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        user_model_1.User.countDocuments({}),
    ]);
    return {
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
});
exports.getAllUsersService = getAllUsersService;
/**
 * Get User by ID Service (Admin only)
 */
const getUserByIdService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId, { password: 0 }).lean();
    if (!user) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
exports.getUserByIdService = getUserByIdService;
/**
 * Update User Service (Admin only)
 * Admin can update any user
 */
const updateUserService = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Update allowed fields
    if (updateData.name !== undefined) {
        user.name = updateData.name;
    }
    if (updateData.phone !== undefined) {
        // Check if phone already exists for another user
        const existingUser = yield user_model_1.User.findOne({ phone: updateData.phone });
        if (existingUser && existingUser._id.toString() !== userId) {
            throw new apiError_1.ApiError(http_status_1.default.CONFLICT, 'Phone number already exists for another user');
        }
        user.phone = updateData.phone;
    }
    if (updateData.role !== undefined) {
        user.role = updateData.role;
    }
    yield user.save();
    // Return user without password
    const _a = user.toObject(), { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return userWithoutPassword;
});
exports.updateUserService = updateUserService;
/**
 * Delete User Service (Admin only)
 * Admin can delete any user
 */
const deleteUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new apiError_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    yield user_model_1.User.findByIdAndDelete(userId);
});
exports.deleteUserService = deleteUserService;
