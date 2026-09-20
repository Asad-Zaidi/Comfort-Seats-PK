const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    fileType: { type: String, enum: ['image', 'video'], default: 'image' },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 },
}, { _id: false });

const WarrantyClaimSchema = new mongoose.Schema({
    claimId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    // Customer details
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
    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
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

    // Order details
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
    },
    orderNumber: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    orderDate: {
        type: Date,
        required: true,
    },

    // Product details
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    productSku: {
        type: String,
        trim: true,
        default: '',
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },

    // Claim / Issue details
    issueType: {
        type: String,
        required: true,
        enum: [
            'Product Defect',
            'Manufacturing Defect',
            'Damaged Product',
            'Part Missing',
            'Part Broken',
            'Mechanical Issue',
            'Material/Fabric Issue',
            'Electrical Issue',
            'Product Not Functioning',
            'Other',
        ],
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
    },

    // Media Attachments
    attachments: [AttachmentSchema],

    // Workflow status
    status: {
        type: String,
        enum: [
            'Pending',
            'Under Review',
            'Approved',
            'Rejected',
            'More Information Required',
            'Resolved',
            'Closed',
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

module.exports = mongoose.model('WarrantyClaim', WarrantyClaimSchema);
