"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_route_1 = __importDefault(require("../modules/users/user.route"));
const blog_route_1 = __importDefault(require("../modules/blogs/blog.route"));
const appRoutes = [
    {
        path: '/user',
        route: user_route_1.default,
    },
    {
        path: '/blog',
        route: blog_route_1.default,
    },
];
appRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
