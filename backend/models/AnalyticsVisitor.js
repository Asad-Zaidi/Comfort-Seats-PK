const mongoose = require("mongoose");

const AnalyticsVisitorSchema = new mongoose.Schema(
    {
        visitorId: { type: String, required: true, unique: true, index: true },
        firstVisit: { type: Date, default: Date.now },
        lastActivity: { type: Date, default: Date.now, index: true },
        totalSessions: { type: Number, default: 1 },
        totalVisits: { type: Number, default: 1 },
        totalPageViews: { type: Number, default: 1 },
        isReturning: { type: Boolean, default: false },
        ip: { type: String, default: "" },
        country: { type: String, default: "Unknown" },
        city: { type: String, default: "Unknown" },
        region: { type: String, default: "Unknown" },
        browser: { type: String, default: "Unknown" },
        browserVersion: { type: String, default: "" },
        os: { type: String, default: "Unknown" },
        deviceType: { type: String, enum: ["Mobile", "Desktop", "Tablet", "Unknown"], default: "Unknown" },
        platform: { type: String, default: "" },
        language: { type: String, default: "" },
        screenResolution: { type: String, default: "" },
    },
    { timestamps: true }
);

AnalyticsVisitorSchema.index({ country: 1, city: 1 });
AnalyticsVisitorSchema.index({ deviceType: 1, browser: 1 });

module.exports = mongoose.model("AnalyticsVisitor", AnalyticsVisitorSchema);
