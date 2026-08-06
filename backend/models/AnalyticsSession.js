const mongoose = require("mongoose");

const AnalyticsSessionSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        visitorId: { type: String, required: true, index: true },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date, default: Date.now },
        lastPulse: { type: Date, default: Date.now, index: true },
        durationSeconds: { type: Number, default: 0 },
        idleTimeSeconds: { type: Number, default: 0 },
        isLive: { type: Boolean, default: true, index: true },
        
        pagesVisited: [
            {
                path: String,
                title: String,
                timestamp: { type: Date, default: Date.now },
                durationSeconds: { type: Number, default: 0 }
            }
        ],
        
        clickCount: { type: Number, default: 0 },
        maxScrollDepth: { type: Number, default: 0 },
        totalEvents: { type: Number, default: 0 },
        
        referrer: { type: String, default: "Direct" },
        trafficChannel: { 
            type: String, 
            enum: ["Direct", "Organic Search", "Social Media", "Referral", "Paid Ads", "Email", "Unknown"], 
            default: "Direct",
            index: true
        },
        landingPage: { type: String, default: "/" },
        exitPage: { type: String, default: "/" },
        
        utmSource: { type: String, default: "" },
        utmMedium: { type: String, default: "" },
        utmCampaign: { type: String, default: "" },
        
        ip: { type: String, default: "" },
        country: { type: String, default: "Unknown" },
        city: { type: String, default: "Unknown" },
        deviceType: { type: String, default: "Unknown" },
        browser: { type: String, default: "Unknown" },
        os: { type: String, default: "Unknown" },
    },
    { timestamps: true }
);

AnalyticsSessionSchema.index({ startTime: -1, isLive: 1 });
AnalyticsSessionSchema.index({ trafficChannel: 1, country: 1 });

module.exports = mongoose.model("AnalyticsSession", AnalyticsSessionSchema);
