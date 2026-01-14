"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'published'],
            message: 'Status must be either "draft" or "published"',
        },
        required: [true, 'Status is required'],
        default: 'draft',
    },
    category: {
        type: String,
        enum: {
            values: [
                'Featured',
                'Announcement',
                'Event',
                'Reminder',
                'News',
                'Alert',
                'Notification',
            ],
            message: 'Category must be one of: Featured, Announcement, Event, Reminder, News, Alert, Notification',
        },
        default: null,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required'],
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    image: {
        type: String,
        default: null,
        // Optional: Add validation for base64 format if needed
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Index for better query performance
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 }); // Index for category filtering
blogSchema.index({ status: 1, category: 1, publishedAt: -1 }); // Composite index for filtering
// Pre-save hook to set publishedAt when status changes to "published"
blogSchema.pre('save', function (next) {
    // If status is being changed to "published" and publishedAt is not set
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    // If status is changed back to "draft", clear publishedAt
    if (this.status === 'draft' && this.publishedAt) {
        this.publishedAt = undefined;
    }
    next();
});
exports.Blog = (0, mongoose_1.model)('Blog', blogSchema);
