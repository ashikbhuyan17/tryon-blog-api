"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => {
        return {
            path: el === null || el === void 0 ? void 0 : el.path,
            message: el === null || el === void 0 ? void 0 : el.message,
        };
    });
    return {
        statusCode: 500,
        message: 'Validation Error',
        errorMessage: errors,
    };
};
exports.handleValidationError = handleValidationError;
