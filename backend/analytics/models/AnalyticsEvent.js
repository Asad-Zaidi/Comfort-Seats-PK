const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, index: true },
        visitorId: { type: String, required: true, index: true },
        eventName: { type: String, required: true, index: true },
        category: { type: String, default: "interaction" },
        path: { type: String, default: "/" },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null, index: true },
        productName: { type: String, default: "" },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsEventModule", AnalyticsEventSchema);
