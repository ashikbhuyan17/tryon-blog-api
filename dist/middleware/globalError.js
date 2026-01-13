"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globarError = void 0;
const config_1 = __importDefault(require("../config"));
const handleValidationError_1 = require("../errorFormating/handleValidationError");
const apiError_1 = require("../errorFormating/apiError");
const logger_1 = require("../utilities/logger");
const zod_1 = require("zod");
const handleZodError_1 = require("../errorFormating/handleZodError");
const globarError = (error, req, res, next) => {
    let statusCode = 400;
    let message = 'Something went wrong';
    let errorMessage = [];
    // Dependency
    config_1.default.env === 'development'
        ? console.log(`Global Error Handler ==`, error)
        : logger_1.errorLogger.error(`Global Error Handler ==`, error);
    // Check for PayloadTooLargeError (request entity too large)
    if ((error === null || error === void 0 ? void 0 : error.type) === 'entity.too.large' ||
        (error === null || error === void 0 ? void 0 : error.name) === 'PayloadTooLargeError') {
        statusCode = 413; // Request Entity Too Large
        message =
            'Request payload too large. Image size limit is 1MB. Please compress or resize your image before uploading.';
        errorMessage = [
            {
                path: 'body.image',
                message: 'Image base64 string is too large. Maximum size is 1MB. Please compress or resize your image.',
            },
        ];
    }
    else if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
        const simplifiedError = (0, handleValidationError_1.handleValidationError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessage = simplifiedError.errorMessage;
    }
    else if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.handleZodError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessage = simplifiedError.errorMessage;
    }
    else if (error instanceof apiError_1.ApiError) {
        statusCode = error === null || error === void 0 ? void 0 : error.statusCode;
        message = error === null || error === void 0 ? void 0 : error.message;
        errorMessage = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: '',
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    else if (error instanceof Error) {
        message = error === null || error === void 0 ? void 0 : error.message;
        errorMessage = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: '',
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    // Return Response
    res.status(statusCode).send({
        success: false,
        message,
        errorMessage,
        stack: config_1.default.env !== 'production' ? error === null || error === void 0 ? void 0 : error.stack : undefined,
    });
};
exports.globarError = globarError;
