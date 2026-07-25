const mongoose = require('mongoose');

const CustomizationSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
    },
    standChoice: {
        type: String,
        trim: true,
        default: '',
    },
    color: {
        type: String,
        trim: true,
        default: '',
    },
    colorName: {
        type: String,
        trim: true,
        default: '',
    },
    fabricType: {
        type: String,
        trim: true,
        default: '',
    },
    dimensions: {
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    customer: {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, default: '' },
        address: { type: String, trim: true, default: '' },
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'completed', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Customization', CustomizationSchema);