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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const apiError_1 = require("../errorFormating/apiError");
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("../app/modules/users/user.model");
/**
 * Auth Middleware
 *
 * This middleware:
 * 1. Extracts JWT token from Authorization header
 * 2. Verifies the token using JWT secret
 * 3. Finds the user in database
 * 4. Attaches user info to request object
 * 5. Returns error if token is invalid/expired or user not found
 */
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get token from Authorization header
        // Format: "Bearer <token>"
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Token is missing!');
        }
        // Verify token
        // jwt.verify throws error if token is invalid or expired
        if (!config_1.default.jwt.secret) {
            throw new apiError_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT secret is not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        // Find user in database
        // Include both _id (Mongoose default) and id (custom)
        const user = yield user_model_1.User.findOne({ id: decoded.id }, { _id: 1, id: 1, phone: 1, role: 1, userType: 1, name: 1 });
        if (!user) {
            throw new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'User not found!');
        }
        // Attach user info to request object
        // This allows route handlers to access user info via req.user
        req.user = {
            id: user.id || '',
            _id: ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            phone: user.phone,
            role: user.role || 'user',
            userType: user.userType || 'reserveit',
        };
        // Continue to next middleware/route handler
        next();
    }
    catch (error) {
        // Handle JWT errors
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Invalid token!'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new apiError_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Token has expired!'));
        }
        else {
            // Pass other errors to global error handler
            next(error);
        }
    }
});
exports.auth = auth;
