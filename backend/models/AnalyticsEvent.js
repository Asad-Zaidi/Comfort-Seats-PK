const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, index: true },
        visitorId: { type: String, required: true, index: true },
        eventName: { 
            type: String, 
            required: true, 
            enum: [
                "page_view", 
                "button_click", 
                "product_view", 
                "add_to_cart", 
                "remove_from_cart", 
                "customize_now",
                "buy_now", 
                "whatsapp_click",
                "wishlist_toggle", 
                "search_performed", 
                "checkout_started", 
                "order_completed",
                "contact_submitted",
                "filter_used",
                "sort_used"
            ],
            index: true
        },
        category: { type: String, default: "engagement" },
        path: { type: String, default: "/" },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null, index: true },
        productName: { type: String, default: "" },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

AnalyticsEventSchema.index({ eventName: 1, timestamp: -1 });

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
