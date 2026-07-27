const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'Anonymous'
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ColorVariantImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    isCover: { type: Boolean, default: false }
}, { _id: false });

const ColorVariantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hex: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    coverImage: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    images: {
        type: [ColorVariantImageSchema],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length >= 0;
            },
            message: 'Invalid images array.'
        }
    }
});

const ProductImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    isCover: { type: Boolean, default: false }
}, { _id: false });

const StandTypeImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    isCover: { type: Boolean, default: false }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    shortDescription: { type: String },
    specifications: { type: [String], default: [] },
    detail: { type: String },
    // Deprecated fields kept for backward compatibility
    color: { type: [String], default: [] },
    size: { type: String, required: false },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    // Array of additional product images (legacy)
    images: { type: [String], default: [] },
    // New: Product images (dynamic, unlimited)
    productImages: {
        type: [ProductImageSchema],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length >= 0;
            },
            message: 'Invalid product images array.'
        }
    },
    // Track which image URL is the cover (for fast lookup)
    coverImage: { type: String, default: '' },
    // New: Color variants with their own images
    colors: {
        type: [ColorVariantSchema],
        default: [],
        validate: {
            validator: function (arr) {
                if (this.isNew || this.isModified('colors')) {
                    if (arr.length === 0) return false;
                    const names = arr.map(c => c.name?.toLowerCase());
                    const uniqueNames = new Set(names);
                    if (names.length !== uniqueNames.size) return false;
                }
                return true;
            },
            message: 'At least one color variant is required and duplicate colors are not allowed.'
        }
    },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reviews: { type: [ReviewSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, unique: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    category: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: 'At least one category is required.'
        }
    },
    subcategory: {
        type: String,
        trim: true,
        default: ''
    },
    standTypes: {
        type: [
            {
                type: {
                    type: String,
                    enum: ['Metallic'],
                    required: true
                },
                price: {
                    type: Number,
                    default: 0
                },
                images: {
                    type: [StandTypeImageSchema],
                    default: [],
                    validate: {
                        validator: function (arr) {
                            return arr.length >= 0;
                        },
                        message: 'Invalid images array.'
                    }
                }
            }
        ],
        default: []
    },
    isCustomizable: { type: Boolean, default: false },
    buyCount: { type: Number, default: 0 },
    // Keep colorVariants for backward compatibility with existing products
    colorVariants: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // --- New Discount Pricing Fields ---
    actualPrice: {
        type: Number,
        default: function () {
            // Default to the existing price field for backward compatibility
            return this.price || 0;
        }
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    isDiscountEnabled: {
        type: Boolean,
        default: false
    },

    // --- Product Wizard & Extended Metadata Fields ---
    brand: { type: String, trim: true, default: '' },
    sku: { type: String, trim: true, default: '' },
    lowStockWarning: { type: Number, default: 5 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive', 'Draft', 'Scheduled'], default: 'Active' },
    publishDate: { type: Date },
    metaOgTitle: { type: String, trim: true, default: '' },
    metaOgDescription: { type: String, trim: true, default: '' },
    metaOgImage: { type: String, trim: true, default: '' },
    twitterTitle: { type: String, trim: true, default: '' },
    twitterDescription: { type: String, trim: true, default: '' },
    twitterImage: { type: String, trim: true, default: '' },
    canonicalUrl: { type: String, trim: true, default: '' },
    shippingWeight: { type: Number, default: 0 },
    shippingDimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 }
    }
});

// Text index optimized for global product search
ProductSchema.index(
    {
        name: 'text',
        shortDescription: 'text',
        description: 'text',
        category: 'text',
        subcategory: 'text',
        metaKeywords: 'text'
    },
    {
        weights: {
            name: 10,
            shortDescription: 5,
            category: 5,
            subcategory: 4,
            metaKeywords: 3,
            description: 1
        },
        name: 'productSearchTextIndex',
        default_language: 'english'
    }
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });

// Compound index to support common filter + search patterns efficiently
ProductSchema.index({ inStock: 1, createdAt: -1 });
ProductSchema.index({ inStock: 1, price: 1 });

const slugify = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isModified('category') || this.isModified('subcategory') || !this.slug) {
        const nameSlug = slugify(this.name);
        const primaryCategory = this.category[0] || '';
        const categorySlug = slugify(primaryCategory);
        const subcategorySlug = slugify(this.subcategory);
        this.slug = subcategorySlug
            ? `${categorySlug}/${subcategorySlug}/${nameSlug}`
            : `${categorySlug}/${nameSlug}`;
    }

    // Sync legacy color field from colors array for backward compatibility
    if (this.isModified('colors')) {
        this.color = this.colors.map(c => c.hex);
    }

    // Ensure only one cover image in productImages
    if (this.isModified('productImages')) {
        const coverCount = this.productImages.filter(img => img.isCover).length;
        if (coverCount > 1) {
            // Keep only the first one as cover
            let foundFirst = false;
            this.productImages.forEach(img => {
                if (img.isCover) {
                    if (!foundFirst) {
                        foundFirst = true;
                    } else {
                        img.isCover = false;
                    }
                }
            });
        }
        // Update coverImage field
        const cover = this.productImages.find(img => img.isCover);
        this.coverImage = cover?.url || this.productImages[0]?.url || '';
    }

    if (this.isModified('reviews')) {
        const validReviews = this.reviews.filter((review) => Number(review.rating) > 0);
        this.totalReviews = validReviews.length;
        this.avgRating = validReviews.length
            ? validReviews.reduce((sum, review) => sum + Number(review.rating), 0) / validReviews.length
            : 0;
    }

    // Sync actualPrice with price if not explicitly set (for backward compatibility)
    if (this.isModified('price') && !this.isModified('actualPrice')) {
        this.actualPrice = this.price;
    }

    next();
});

module.exports = mongoose.model('Product', ProductSchema);