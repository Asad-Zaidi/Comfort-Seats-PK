const mongoose = require('mongoose');

const BulkOrderProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    sku: {
        type: String,
        trim: true,
        default: '',
    },
    price: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
    imageUrl: {
        type: String,
        default: '',
    },
}, { _id: false });

const BulkOrderSchema = new mongoose.Schema({
    quoteId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        default: '',
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    companyName: {
        type: String,
        required: false,
        trim: true,
        default: '',
    },

    // Products requested
    products: [BulkOrderProductSchema],

    totalQuantity: {
        type: Number,
        required: false,
        default: 1,
        min: 0,
    },

    // Delivery location
    deliveryAddress: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
        default: '',
    },
    postalCode: {
        type: String,
        trim: true,
        default: '',
    },
    country: {
        type: String,
        trim: true,
        default: 'Pakistan',
    },

    // Custom details / specifications
    additionalDetails: {
        type: String,
        trim: true,
        default: '',
    },

    // Pricing & discount calculations
    discountTier: {
        type: String,
        default: '',
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    estimatedSubtotal: {
        type: Number,
        default: 0,
    },
    estimatedDiscount: {
        type: Number,
        default: 0,
    },
    estimatedTotal: {
        type: Number,
        default: 0,
    },

    // Workflow status
    status: {
        type: String,
        enum: [
            'Pending',
            'Under Review',
            'Quote Sent',
            'Approved',
            'Rejected',
            'Converted to Order',
            'Cancelled',
            'Completed',
        ],
        default: 'Pending',
        index: true,
    },
    adminNotes: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('BulkOrder', BulkOrderSchema);
