const mongoose = require("mongoose");

const AnalyticsSessionSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        visitorId: { type: String, required: true, index: true },
        sessionStart: { type: Date, default: Date.now },
        sessionEnd: { type: Date, default: Date.now },
        sessionDuration: { type: Number, default: 0 },
        idleTime: { type: Number, default: 0 },
        landingPage: { type: String, default: "/" },
        exitPage: { type: String, default: "/" },
        numberOfPages: { type: Number, default: 1 },
        eventsCount: { type: Number, default: 0 },
        scrollDepth: { type: Number, default: 0 },
        referrer: { type: String, default: "Direct" },
        trafficChannel: { type: String, default: "Direct", index: true },
        pagesVisited: [
            {
                path: String,
                title: String,
                timestamp: { type: Date, default: Date.now },
                duration: { type: Number, default: 0 },
            },
        ],
        isLive: { type: Boolean, default: true, index: true },
        lastPulse: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

AnalyticsSessionSchema.index({ sessionStart: -1, isLive: 1 });

module.exports = mongoose.model("AnalyticsSessionModule", AnalyticsSessionSchema);
