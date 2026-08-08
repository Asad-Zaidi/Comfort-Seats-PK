const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Blog title cannot exceed 200 characters'],
    },
    slug: {
        type: String,
        required: [true, 'Blog slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    thumbnail: {
        type: String,
        default: '',
        trim: true,
    },
    banner: {
        type: String,
        default: '',
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Blog content is required'],
        default: '',
    },
    summary: {
        type: String,
        trim: true,
        default: '',
        maxlength: [350, 'Summary cannot exceed 350 characters'],
    },
    author: {
        type: String,
        trim: true,
        default: 'Comfort Seats PK',
    },
    readTime: {
        type: String,
        trim: true,
        default: '3 min read',
    },
    category: {
        type: String,
        trim: true,
        default: 'General',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    seoTitle: {
        type: String,
        trim: true,
        default: '',
    },
    seoDescription: {
        type: String,
        trim: true,
        default: '',
    },
    seoKeywords: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

// Calculate estimated reading time before saving
BlogSchema.pre('save', function (next) {
    if (this.content) {
        // Strip HTML tags and count words
        const plainText = this.content.replace(/<[^>]*>?/gm, ' ');
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        this.readTime = `${minutes} min read`;
    }
    if (!this.summary && this.content) {
        const plainText = this.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        this.summary = plainText.length > 180 ? `${plainText.substring(0, 177)}...` : plainText;
    }
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
