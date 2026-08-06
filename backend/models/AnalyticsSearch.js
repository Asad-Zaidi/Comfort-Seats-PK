const mongoose = require("mongoose");

const AnalyticsSearchSchema = new mongoose.Schema(
    {
        query: { type: String, required: true, lowercase: true, trim: true, index: true },
        count: { type: Number, default: 1 },
        resultCount: { type: Number, default: 0 },
        isZeroResult: { type: Boolean, default: false, index: true },
        conversions: { type: Number, default: 0 },
        lastSearched: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsSearch", AnalyticsSearchSchema);
