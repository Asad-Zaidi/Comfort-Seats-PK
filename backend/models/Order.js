const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    product: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String },
        color: { type: String },
        size: { type: String },
        slug: { type: String, default: '' },
        // Discount pricing fields for historical accuracy
        actualPrice: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        isDiscountEnabled: { type: Boolean, default: false },
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    customer: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank', 'card', 'online'],
        default: 'cod',
    },
    // Stores details of the specific online payment method chosen by the customer
    selectedOnlineMethod: {
        methodId: { type: String, default: '' },
        name: { type: String, default: '' },
        type: { type: String, default: '' },
        icon: { type: String, default: '' },
    },
    deliveryMethod: {
        type: String,
        enum: ['standard', 'fast'],
        default: 'standard',
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    transactionRef: {
        type: String,
        trim: true,
        default: '',
    },
    paymentReceipt: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending',
    },
    shipping: {
        courierName: { type: String, default: '' },
        trackingNumber: { type: String, default: '' },
        trackingUrl: { type: String, default: '' },
        shippedAt: { type: Date },
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', OrderSchema);