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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    id: {
        type: String,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{11}$/.test(v);
            },
            message: 'Phone must be exactly 11 digits',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: 0, // Don't return password by default in queries
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['admin', 'user'],
        default: 'user',
    },
    userType: {
        type: String,
        required: [true, 'UserType is required'],
        enum: ['reserveit'],
        default: 'reserveit',
    },
}, {
    timestamps: true,
});
// Hash password before saving to database
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only hash password if it's been modified (or is new)
        if (!this.isModified('password')) {
            return next();
        }
        // Hash password with cost of 12
        this.password = yield bcrypt_1.default.hash(this.password, 12);
        next();
    });
});
// Static method to check if user exists
// Returns both _id (Mongoose default) and id (custom)
userSchema.statics.isUserExist = function (phone) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield this.findOne({ phone }, { _id: 1, id: 1, phone: 1, password: 1, role: 1, userType: 1, name: 1 }).lean();
        if (!user) {
            return null;
        }
        // Convert ObjectId to string for _id
        return Object.assign(Object.assign({}, user), { _id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString() });
    });
};
// Static method to check if password matches
userSchema.statics.isPasswordMatched = function (givenPassword, savedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(givenPassword, savedPassword);
    });
};
exports.User = (0, mongoose_1.model)('User', userSchema);
