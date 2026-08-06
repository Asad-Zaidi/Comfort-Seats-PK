const mongoose = require("mongoose");

const AnalyticsDeviceSchema = new mongoose.Schema(
    {
        visitorId: { type: String, required: true, index: true },
        deviceType: { type: String, default: "Desktop" },
        operatingSystem: { type: String, default: "Windows" },
        browser: { type: String, default: "Chrome" },
        browserVersion: { type: String, default: "" },
        screenResolution: { type: String, default: "" },
        viewport: { type: String, default: "" },
        pixelRatio: { type: Number, default: 1 },
        language: { type: String, default: "en-US" },
        platform: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnalyticsDeviceModule", AnalyticsDeviceSchema);
