const mongoose = require('mongoose');

const BulkDiscountTierSchema = new mongoose.Schema({
    minQuantity: {
        type: Number,
        required: true,
        min: 1,
    },
    maxQuantity: {
        type: Number,
        default: null, // null means unlimited (e.g. 51+)
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    label: {
        type: String,
        required: true,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Helper static method to get default tiers if none exist in the database
BulkDiscountTierSchema.statics.getTiers = async function () {
    let tiers = await this.find({ active: true }).sort({ order: 1, minQuantity: 1 });
    if (!tiers || tiers.length === 0) {
        const defaultTiers = [
            { minQuantity: 5, maxQuantity: 10, discountPercentage: 5, label: '5–10 chairs', active: true, order: 1 },
            { minQuantity: 11, maxQuantity: 20, discountPercentage: 10, label: '11–20 chairs', active: true, order: 2 },
            { minQuantity: 21, maxQuantity: 50, discountPercentage: 15, label: '21–50 chairs', active: true, order: 3 },
            { minQuantity: 51, maxQuantity: null, discountPercentage: 20, label: '51+ chairs', active: true, order: 4 },
        ];
        tiers = await this.insertMany(defaultTiers);
    }
    return tiers;
};

module.exports = mongoose.model('BulkDiscountTier', BulkDiscountTierSchema);
