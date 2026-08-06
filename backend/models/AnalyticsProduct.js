const mongoose = require("mongoose");

const AnalyticsProductSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true, index: true },
        productName: { type: String, default: "" },
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        addToCartCount: { type: Number, default: 0 },
        wishlistCount: { type: Number, default: 0 },
        buyNowCount: { type: Number, default: 0 },
        quantityPurchased: { type: Number, default: 0 },
        revenueGenerated: { type: Number, default: 0 },
        totalViewTimeSeconds: { type: Number, default: 0 },
        avgViewTimeSeconds: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsProduct", AnalyticsProductSchema);
