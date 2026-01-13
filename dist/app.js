"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const globalError_1 = require("./middleware/globalError");
const http_status_1 = __importDefault(require("http-status"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
// Set body size limit to 1MB for base64 images
// Default limit is 100kb, which is too small for base64 encoded images
// 1MB limit prevents excessively large images
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Data API
app.use('/api/v1', routes_1.default);
// Testing API
app.get('/', (req, res) => {
    res.send('+++ App Running Successfully +++');
    // Uncought Error
    // console.log(x)
    // Test Error
    // throw new Error('General Error')
    // Test API Error
    // throw new ApiError(403, 'API Error')
    // Promiss rejection
    // Promise.reject(new Error(`Unhandle Promiss Rejection`))
});
// Global error handle
app.use(globalError_1.globarError);
// Unknown API Handle
app.use((req, res) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: 'Not Found',
        errorMessage: [
            {
                path: req.originalUrl,
                message: 'API Not Found',
            },
        ],
    });
});
exports.default = app;
