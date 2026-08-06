const mongoose = require("mongoose");

const AnalyticsPerformanceSchema = new mongoose.Schema(
    {
        path: { type: String, default: "/" },
        loadTimeMs: { type: Number, default: 0 },
        fcpMs: { type: Number, default: 0 },
        lcpMs: { type: Number, default: 0 },
        cls: { type: Number, default: 0 },
        inpMs: { type: Number, default: 0 },
        apiResponseTimeMs: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsPerformance", AnalyticsPerformanceSchema);
