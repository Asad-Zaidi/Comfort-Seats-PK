const analyticsService = require("../services/analyticsService");

/**
 * @desc    Receive visitor pulse (heartbeat / route change)
 * @route   POST /api/analytics/pulse
 * @access  Public
 */
exports.trackPulse = async (req, res) => {
    try {
        if (req.isBot) {
            return res.status(200).json({ success: true, message: "Bot traffic ignored." });
        }

        const {
            visitorId,
            sessionId,
            path,
            title,
            referrer,
            viewport,
            screenResolution,
            language,
            utmSource,
            utmMedium,
            utmCampaign,
            clickCount,
            scrollDepth,
            durationSeconds,
        } = req.body;

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const userAgent = req.headers["user-agent"] || "";

        const result = await analyticsService.processPulse({
            visitorId,
            sessionId,
            path,
            title,
            referrer,
            userAgent,
            ip,
            viewport,
            screenResolution,
            language,
            utmSource,
            utmMedium,
            utmCampaign,
            clickCount,
            scrollDepth,
            durationSeconds,
        });

        // Broadcast to live websocket clients if io is attached
        if (req.io) {
            req.io.emit("analytics:pulse", {
                sessionId,
                visitorId,
                path,
                timestamp: new Date(),
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Analytics pulse error:", error);
        return res.status(500).json({ success: false, message: "Analytics pulse failed." });
    }
};

/**
 * @desc    Track discrete user action event
 * @route   POST /api/analytics/event
 * @access  Public
 */
exports.trackEvent = async (req, res) => {
    try {
        if (req.isBot) {
            return res.status(200).json({ success: true, message: "Bot traffic ignored." });
        }

        const { sessionId, visitorId, eventName, category, path, productId, productName, payload } = req.body;

        const event = await analyticsService.processEvent({
            sessionId,
            visitorId,
            eventName,
            category,
            path,
            productId,
            productName,
            payload,
        });

        if (req.io) {
            req.io.emit("analytics:event", event);
        }

        return res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error("Analytics event error:", error);
        return res.status(500).json({ success: false, message: "Event tracking failed." });
    }
};

/**
 * @desc    Track Web Performance & Vitals
 * @route   POST /api/analytics/performance
 * @access  Public
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
 * @access  Private (Admin)
 */
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const days = Number(req.query.days) || 7;
        const analytics = await analyticsService.getDashboardAnalytics(days);
        return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        console.error("Get analytics dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch analytics data." });
    }
};
