const mongoose = require("mongoose");

const AnalyticsVisitorSchema = new mongoose.Schema(
    {
        visitorId: { type: String, required: true, unique: true, index: true },
        firstVisit: { type: Date, default: Date.now },
        lastVisit: { type: Date, default: Date.now, index: true },
        lastActivity: { type: Date, default: Date.now, index: true },
        totalVisits: { type: Number, default: 1 },
        totalSessions: { type: Number, default: 1 },
        totalPageViews: { type: Number, default: 1 },
        isReturning: { type: Boolean, default: false },
        isOnline: { type: Boolean, default: true, index: true },
        currentStatus: { type: String, default: "active" },
        ip: { type: String, default: "" },
        country: { type: String, default: "Pakistan" },
        city: { type: String, default: "Lahore" },
        region: { type: String, default: "Punjab" },
        browser: { type: String, default: "Unknown" },
        os: { type: String, default: "Unknown" },
        deviceType: { type: String, enum: ["Mobile", "Desktop", "Tablet", "Unknown"], default: "Unknown" },
    },
    { timestamps: true }
);

AnalyticsVisitorSchema.index({ isOnline: 1, lastActivity: -1 });

module.exports = mongoose.model("AnalyticsVisitorModule", AnalyticsVisitorSchema);
