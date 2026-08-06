const mongoose = require("mongoose");

const AnalyticsPageSchema = new mongoose.Schema(
    {
        path: { type: String, required: true, unique: true, index: true },
        title: { type: String, default: "" },
        totalViews: { type: Number, default: 0 },
        uniqueViews: { type: Number, default: 0 },
        totalTimeSeconds: { type: Number, default: 0 },
        avgTimeSeconds: { type: Number, default: 0 },
        bounceCount: { type: Number, default: 0 },
        exitCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsPage", AnalyticsPageSchema);
