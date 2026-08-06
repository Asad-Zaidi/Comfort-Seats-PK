const mongoose = require("mongoose");

const AnalyticsLocationSchema = new mongoose.Schema(
    {
        visitorId: { type: String, required: true, index: true },
        ip: { type: String, default: "" },
        country: { type: String, default: "Pakistan", index: true },
        city: { type: String, default: "Lahore", index: true },
        state: { type: String, default: "Punjab" },
        region: { type: String, default: "Punjab" },
        timeZone: { type: String, default: "Asia/Karachi" },
        isp: { type: String, default: "" },
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsLocationModule", AnalyticsLocationSchema);
