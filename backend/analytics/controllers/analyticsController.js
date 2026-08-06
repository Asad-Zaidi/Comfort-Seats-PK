const analyticsService = require("../services/analyticsService");

/**
 * @desc    Receive visitor pulse
 * @route   POST /api/analytics/pulse
 */
exports.trackPulse = async (req, res) => {
    try {
        if (req.isBot) {
            return res.status(200).json({ success: true, message: "Bot traffic ignored." });
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const userAgent = req.headers["user-agent"] || "";

        const result = await analyticsService.processPulse({
            ...req.body,
            ip,
            userAgent,
        });

        if (req.io) {
            req.io.emit("analytics:pulse", {
                sessionId: req.body.sessionId,
                visitorId: req.body.visitorId,
                path: req.body.path,
                timestamp: new Date(),
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Pulse error:", error);
        return res.status(500).json({ success: false, message: "Pulse tracking failed." });
    }
};

/**
 * @desc    Track user action event
 * @route   POST /api/analytics/event
 */
exports.trackEvent = async (req, res) => {
    try {
        if (req.isBot) {
            return res.status(200).json({ success: true, message: "Bot traffic ignored." });
        }

        const event = await analyticsService.processEvent(req.body);

        if (req.io) {
            req.io.emit("analytics:event", event);
        }

        return res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error("Event error:", error);
        return res.status(500).json({ success: false, message: "Event tracking failed." });
    }
};

/**
 * @desc    Track Web Performance Vitals
 * @route   POST /api/analytics/performance
 */
exports.trackPerformance = async (req, res) => {
    try {
        const perf = await analyticsService.processPerformance(req.body);
        return res.status(200).json({ success: true, data: perf });
    } catch (error) {
        console.error("Performance tracking error:", error);
        return res.status(500).json({ success: false, message: "Performance tracking failed." });
    }
};

/**
 * @desc    Get Aggregated Dashboard Analytics
 * @route   GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const days = Number(req.query.days) || 7;
        const analytics = await analyticsService.getDashboardAnalytics(days);
        return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        console.error("Analytics dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch analytics data." });
    }
};
