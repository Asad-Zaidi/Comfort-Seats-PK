const mongoose = require("mongoose");

const AnalyticsTrafficSchema = new mongoose.Schema(
    {
        source: { type: String, required: true, index: true },
        channel: { type: String, required: true, index: true },
        count: { type: Number, default: 1 },
        percentage: { type: Number, default: 0 },
        date: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsTrafficModule", AnalyticsTrafficSchema);
