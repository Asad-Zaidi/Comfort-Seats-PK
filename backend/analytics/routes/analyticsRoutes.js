const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { analyticsBotFilter } = require("../middleware/analyticsMiddleware");

// Public client tracking endpoints
router.post("/pulse", analyticsBotFilter, analyticsController.trackPulse);
router.post("/event", analyticsBotFilter, analyticsController.trackEvent);
router.post("/performance", analyticsController.trackPerformance);

// Protected admin dashboard endpoints
router.get("/dashboard", analyticsController.getDashboardAnalytics);

module.exports = router;
